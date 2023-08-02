import {
  Persister,
  Store,
  createStore,
  DatabasePersisterConfig,
} from "tinybase";
import { Subscription } from "expo-modules-core";
import { ResultSet, ResultSetError, SQLiteDatabase } from "expo-sqlite";
import {
  UpdateListener,
  createSqlitePersister,
} from "../persisters/sqlite/create";

export const store = createStore().setTablesSchema({
  todo: {
    id: { type: "number" },
    text: { type: "string" },
    completed: { type: "number", default: 0 },
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
    ): Promise<(ResultSetError | ResultSet)[]> => {
      const result = await db.execAsync([{ sql, args }], false);
      // @ts-ignore
      return result[0].rows;
    },

    (listener: UpdateListener): Subscription =>
      db.onDatabaseChange(({ tableName }) => listener(tableName)),
    (subscription: Subscription) => subscription.remove()
  );
