import * as SQLite from "expo-sqlite/next";
import { decode, encode } from "base-64";
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// TODO: ideally we can share the schema in a package between client and server
// this is curently duplicated into /server/schemas/test.sql
const schema = `CREATE TABLE IF NOT EXISTS "todo" ("id" PRIMARY KEY, "text", "completed" INTEGER DEFAULT 0);`;

export async function initDatabase(db: SQLite.SQLiteDatabase) {
  return await db.execAsync(schema);
}
