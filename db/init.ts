import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabase("test.db");

export function initDatabase() {
  db.exec(
    [
      {
        sql: 'CREATE TABLE IF NOT EXISTS "todo" ("id" PRIMARY KEY, "text", "completed");',
        args: [],
      },
      {
        sql: 'CREATE TABLE IF NOT EXISTS "presence" (id PRIMARY KEY, name, x, y)',
        args: [],
      },
      {
        sql: "SELECT crsql_as_crr('todo');",
        args: [],
      },
      {
        sql: "SELECT crsql_as_crr('presence');",
        args: [],
      },
      // {
      //   sql: "DELETE FROM todo",
      //   args: [],
      // },
    ],
    false,
    false,
    () => {}
  );
}
