import "expo-dev-client";
import { initDatabase, db } from "./app/db/init";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
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

const uri =
  "https://images.unsplash.com/photo-1631891318333-dc891d26f52a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGxhbmRtYXJrcyUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60";

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
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          blurRadius={15}
        />
        <View style={{ gap: 10, marginTop: 60, width: "80%" }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={addTodo}
              style={[styles.btn, { flex: 1 }]}
            >
              <Text style={styles.btnText}>Add Todo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={deleteTodo}
              style={[styles.btn, { flex: 1 }]}
            >
              <Text style={styles.btnText}>Delete All Todos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setSyncEnabled((s) => !s)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {syncEnabled ? "Disable Sync" : "Enable"}
            </Text>
          </TouchableOpacity>
        </View>
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
    gap: 10,
  },
  btn: { backgroundColor: "white", padding: 10, borderRadius: 5 },
  btnText: { fontSize: 18, textAlign: "center" },
});
