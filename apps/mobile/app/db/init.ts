import * as SQLite from "expo-sqlite/next";
import { createSingletonDbProvider } from "../sync/SyncedExpoDB";
import { cryb64 } from "@vlcn.io/ws-common";
import { decode, encode } from "base-64";
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

export const dbName = "test.db";
export const db = SQLite.openDatabaseSync(dbName, {
  enableChangeListener: true,
  enableCRSQLite: true,
});

// TODO: ideally we can share the schema in a package between client and server
// this is curently duplicated into /server/schemas/test.sql
const schema = [
  `CREATE TABLE IF NOT EXISTS "todo" ("id" PRIMARY KEY, "text", "completed" INTEGER DEFAULT 0);`,
  `SELECT crsql_as_crr('todo');`,
];

export function initDatabase() {
  db.execAsync(schema.join("\n"));
}

export const dbProvider = createSingletonDbProvider({
  dbName,
  db,
  // TODO: users shouldn't manually deal with any of this.
  // The browser db wrappers of cr-sqlite support automigration
  // but we don't have that in the Expo bindings yet.
  schemaName: "test.sql",
  schemaVersion: cryb64(schema.join("\n")),
});
