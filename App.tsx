import "expo-dev-client";
import { initDatabase, db } from "./app/db/init";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, ScrollView } from "react-native";
import { TodoRow } from "./app/todo";
import { useSync } from "./app/useSync";
import {
  Provider,
  SortedTableView,
  useCreatePersister,
  useDelTableCallback,
  useStore,
} from "tinybase/lib/ui-react";
import { createExpoSqlitePersister, store } from "./app/store";
import { generateRandomTodo, nanoid } from "./app/utils";
import { useCallback, useEffect } from "react";

export default function App() {
  return (
    <Provider store={store}>
      <TodoList />
    </Provider>
  );
}

function TodoList() {
  const store = useStore();
  const { syncEnabled, setSyncEnabled } = useSync();

  useEffect(() => {
    initDatabase();
  }, []);

  useCreatePersister(
    store,
    (store) =>
      createExpoSqlitePersister(store, db, {
        mode: "tabular",
        tables: {
          load: { todo: { tableId: "todo", rowIdColumnName: "id" } },
          save: { todo: { tableName: "todo", rowIdColumnName: "id" } },
        },
      }),
    [db],
    async (persister) => {
      await persister.startAutoLoad();
      await persister.startAutoSave();
    }
  );

  const addTodo = useCallback(
    () => store.setCell("todo", nanoid(10), "text", generateRandomTodo()),
    [store]
  );

  const deleteTodo = useDelTableCallback("todo", store);

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 60 }}>
          Todo List
        </Text>
        <Button title="Add Todo" onPress={addTodo} />
        <Button title="Delete All Todos" onPress={deleteTodo} />
        <Button
          title={syncEnabled ? "Disable Sync" : "Enable"}
          onPress={() => setSyncEnabled((s) => !s)}
        />
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ padding: 10, paddingBottom: 44 }}
        >
          <SortedTableView
            store={store}
            tableId="todo"
            descending={true}
            rowComponent={TodoRow}
          />
        </ScrollView>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
