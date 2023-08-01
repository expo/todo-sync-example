import {
  Persister,
  Store,
  createStore,
  DatabasePersisterConfig,
} from "tinybase";
import { Subscription } from "expo-modules-core";
import { generateRandomTodo } from "./utils";
import { ResultSet, ResultSetError, SQLiteDatabase } from "expo-sqlite";
import {
  UpdateListener,
  createSqlitePersister,
} from "./persisters/sqlite/create";
import { db } from "./db/init";

export const store = createStore().setTablesSchema({
  todos: {
    id: { type: "number" },
    text: { type: "string" },
    completed: { type: "boolean", default: false },
  },
});

export const createExpoSqlitePersister = (
  store: Store,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string
): Persister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (
      sql: string,
      args: any[] = []
    ): Promise<(ResultSetError | ResultSet)[]> =>
      await db.execAsync([{ sql, args }], false),
    (listener: UpdateListener): Subscription =>
      db.onSqliteUpdate(({ tableName }) => listener(tableName)),
    (subscription: Subscription): void => subscription.remove()
  );

export const persister = createExpoSqlitePersister(store, db, {
  mode: "tabular",
  tables: {
    load: { todos: "todos" },
    save: { todos: "todos" },
  },
});
