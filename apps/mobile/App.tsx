import { initDatabase, db, dbProvider, dbName } from "./app/db/init";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { TodoRow } from "./app/todo";
import {
  Provider,
  SortedTableView,
  useCreatePersister,
  useDelTableCallback,
  useStore,
} from "tinybase/lib/ui-react";
import { createExpoSqlitePersister } from "tinybase/lib/persisters/persister-expo-sqlite";
import { generateRandomTodo, nanoid } from "./app/utils";
import { useCallback, useEffect } from "react";
import { createSyncedDB, defaultConfig } from "@vlcn.io/ws-client";
import { store } from "./app/store";

const uri =
  "https://images.unsplash.com/photo-1631891318333-dc891d26f52a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGxhbmRtYXJrcyUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60";

export default function App() {
  return (
    <Provider store={store}>
      <TodoList />
    </Provider>
  );
}

const host = Platform.OS === "ios" ? "localhost" : "10.0.2.2";

function TodoList() {
  const store = useStore();

  // TODO: allow enabling/disabling sync
  // TODO: return cleanup
  useEffect(() => {
    initDatabase();
    const syncedDbPromise = createSyncedDB({
      dbProvider: dbProvider,
      transportProvider: defaultConfig.transportProvider,
    }, dbName, {
      room: "my-room",
      url: "ws://localhost:8080/sync",
    }).then(synced => {
      synced.start();
      return synced;
    });

    return () => {
      syncedDbPromise.then((synced) => synced.stop());
    }
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
      },
      console.info,
    ),
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
