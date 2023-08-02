import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabase("test.db");

export function initDatabase() {
  db.exec(
    [
      {
        sql: 'CREATE TABLE IF NOT EXISTS "todo" ("id" PRIMARY KEY, "text", "completed" INTEGER DEFAULT 0);',
        args: [],
      },
      {
        sql: "SELECT crsql_as_crr('todo');",
        args: [],
      },
    ],
    false,
    () => {}
  );
}
