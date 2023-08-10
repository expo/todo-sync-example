import * as SQLite from "expo-sqlite";
import { createSingletonDbProvider } from "../sync/SyncedExpoDB";
import { cryb64 } from "@vlcn.io/ws-common";

export const db = SQLite.openDatabase("test.db");

// TODO: ideally we can share this in a package between client and server
// Also see -- https://github.com/vlcn-io/cr-sqlite/issues/318
const schema = [
  `CREATE TABLE IF NOT EXISTS "todo" ("id" PRIMARY KEY, "text", "completed" INTEGER DEFAULT 0);`,
  `SELECT crsql_as_crr('todo');`
];

export function initDatabase() {
  db.exec(
    schema.map((sql) => ({ sql, args: [] })),
    false,
    () => {}
  );
}

export const dbProvider = createSingletonDbProvider({
  dbName: "test.db",
  db,
  schemaName: "test",
  schemaVersion: cryb64(schema.join("\n")),
});
