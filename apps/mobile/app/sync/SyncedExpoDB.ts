import { DB } from "@vlcn.io/ws-client";
import { Change, bytesToHex, hexToBytes } from "@vlcn.io/ws-common";
import { SQLiteDatabase } from "expo-sqlite";

class SyncedExpoDB implements DB {
  #db: SQLiteDatabase;
  #siteId: Uint8Array;
  #schemaName: string;
  #schemaVersion: bigint;

  constructor(db: SQLiteDatabase, siteId: Uint8Array, schemaName: string, schemaVersion: bigint) {
    this.#db = db;
    this.#siteId = siteId;
    this.#schemaName = schemaName;
    this.#schemaVersion = schemaVersion;
  }

  get siteid() {
    return this.#siteId;
  }

  onChange(cb: () => void): () => void {
    console.log('registering db listener...');
    const subscription = this.#db.onDatabaseChange(cb);
    return () => {
      subscription.remove();
    };
  }

  getSchemaNameAndVersion(): PromiseLike<[string, bigint]> {
    return Promise.resolve([this.#schemaName, this.#schemaVersion]);
  }

  async pullChangeset(since: readonly [bigint, number], excludeSites: readonly Uint8Array[], localOnly: boolean): Promise<readonly Change[]> {
    console.log('pulling changes');
      const resultSet = await this.#db.execAsync([
        {
          // Have to do a hex conversion since expo-sqlite doesn't support blobs
          // 0 as "cl" is a placeholder given cl does not exist in 0.14.0
          sql: `SELECT "table", hex("pk") as "pk", "cid", "val", "col_version", "db_version", 0 as "cl" FROM crsql_changes WHERE db_version > ? AND site_id IS NOT unhex(?)`,
          args: [Number(since[0]), bytesToHex(excludeSites[0])],
        }
      ], true);
      const ret = resultSet[0];
      if ('error' in ret) {
        throw ret.error;
      }
      console.log(`Pulled ${ret.rows.length} changes since ${since[0]}`);
      return ret.rows.map((row) => {
        const { table, pk, cid, val, col_version, db_version, cl } = row;
        return [
          table,
          // and then back to a bytes again :/
          hexToBytes(pk),
          cid,
          val,
          BigInt(col_version),
          BigInt(db_version),
          null,
          BigInt(cl),
        ];
      });
  }

  async applyChangesetAndSetLastSeen(changes: readonly Change[], siteId: Uint8Array, end: readonly [bigint, number]): Promise<void> {
    console.log('applying changes');
      await this.#db.transactionAsync(async (transaction) => {
        const sql = `INSERT INTO crsql_changes ("table", "pk", "cid", "val", "col_version", "db_version", "site_id") VALUES (?, unhex(?), ?, ?, ?, ?, unhex(?))`;
        for (const change of changes) {
          const [table, pk, cid, val, col_version, db_version, _, cl] = change;
          // TODO: expo blob bindings may still not work.. in which case we need to finagle with the bindings and `pk` to get it to work
          // doing these inserts in parallel wouldn't make sense hence awaiting in a loop.
          // also col_version, db_version may need to be coerced to numbers from bigints...
          // oof... the lack of bigin 😬
          const bind = [table, bytesToHex(pk), cid, typeof val === 'bigint' ? Number(val) : val, Number(col_version), Number(db_version), bytesToHex(siteId)];
          console.log(bind);
          await transaction.executeSqlAsync(sql, bind);
          console.log(bind);
        }
        await transaction.executeSqlAsync(
          `INSERT INTO "crsql_tracked_peers" ("site_id", "event", "version", "seq", "tag") VALUES (unhex(?), ?, ?, ?, 0) ON CONFLICT DO UPDATE SET
          "version" = MAX("version", excluded."version"),
          "seq" = CASE "version" > excluded."version" WHEN 1 THEN "seq" ELSE excluded."seq" END`,
          // TODO: expo doesn't support bigints.
          // This is okish since we'll never actually hit 2^53
          // TODO: hexify siteId? and unhex it in the db?
          [bytesToHex(siteId), 0, Number(end[0]), end[1]]
        );
      });
  }

  async getLastSeens(): Promise<[Uint8Array, [bigint, number]][]> {
    console.log('getting last seens');
      // TODO: more hexing and unhexing due to lack of blob support
      // in the expo bindings
      const resultSet = await this.#db.execAsync([
        {
          sql: `SELECT hex("site_id") as "site_id", "version", "seq" FROM crsql_tracked_peers`,
          args: [],
        }
      ], true);
      const ret = resultSet[0];
      if ('error' in ret) {
        throw ret.error;
      }
      return ret.rows.map((row) => {
        const { site_id, version, seq } = row;
        return [hexToBytes(site_id), [BigInt(version), seq]];
      });
  }

  close(closeWrappedDB: false) {
    if (closeWrappedDB) {
      this.#db.closeSync();
    }
  }
}

export type SingletonDescriptor = {
  dbName: string;
  db: SQLiteDatabase;
  schemaName: string;
  schemaVersion: bigint;
};
// This is a basic provider just for demonstration purposes.
// It expect callers to use an already open an existing database.
export function createSingletonDbProvider(
  { dbName: requiredDbName, db, schemaName, schemaVersion }: SingletonDescriptor
): (dbName: string) => Promise<DB> {
  return async (dbName: string) => {
    if (dbName !== requiredDbName) {
      throw new Error(`The singleton provider only supports ${requiredDbName}`);
    }
    const resultSet = await db.execAsync([
      {
        sql: `SELECT hex(crsql_siteid()) as site_id`,
        args: [],
      }],
    true);
    const ret = resultSet[0];
    if ('error' in ret) {
      throw ret.error;
    }
    const siteId = hexToBytes(ret.rows[0]['site_id']);
    return new SyncedExpoDB(db, siteId, schemaName, schemaVersion);
  }
}