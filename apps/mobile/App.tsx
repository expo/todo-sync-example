import { initDatabase, dbName, useDBProvider } from "./app/db/init";
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
import { FlashList } from "@shopify/flash-list";
import { Todo, TodoRow } from "./app/todo";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite/next";
import { useEffect, useState } from "react";
import { generateRandomTodo } from "./app/utils";
import { createSyncedDB, defaultConfig } from "@vlcn.io/ws-client";

const uri =
  "https://images.unsplash.com/photo-1631891318333-dc891d26f52a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGxhbmRtYXJrcyUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60";

export default function App() {
  return (
    <SQLiteProvider
      dbName={dbName}
      initHandler={initDatabase}
      options={{ enableCRSQLite: true, enableChangeListener: true }}
      errorHandler={(e) => {
        console.log(e);
      }}
    >
      <TodoList />
    </SQLiteProvider>
  );
}

const host = Platform.OS === "ios" ? "localhost" : "10.0.2.2";

function TodoList() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const dbProvider = useDBProvider();

  useEffect(() => {
    const syncedDbPromise = createSyncedDB(
      {
        dbProvider: dbProvider,
        transportProvider: defaultConfig.transportProvider,
      },
      dbName,
      {
        room: "my-room",
        url: `ws://${host}:8080/sync`,
      }
    ).then((synced) => {
      console.log({ synced });
      synced.start();
      return synced;
    });

    return () => {
      syncedDbPromise.then((synced) => synced.stop());
    };
  }, []);

  useEffect(() => {
    db.allAsync<Todo>("SELECT * FROM todo", []).then((rows) => {
      setTodos(rows);
    });
  }, []);

  const addTodo = async () => {
    const newTodo = generateRandomTodo();
    await db.runAsync(`INSERT INTO todo (text, completed) VALUES (?, ?)`, [
      newTodo,
      false,
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={15}
      />
      <View
        style={{
          gap: 10,
          marginTop: 60,
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, width: "80%" }}>
          <TouchableOpacity onPress={addTodo} style={[styles.btn, { flex: 1 }]}>
            <Text style={styles.btnText}>Add Todo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log("Delete");
            }}
            style={[styles.btn, { flex: 1 }]}
          >
            <Text style={styles.btnText}>Delete All Todos</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, padding: 10, paddingBottom: 44 }}>
        <FlashList
          data={todos}
          renderItem={({ item: todo }) => <TodoRow todo={todo} />}
          estimatedItemSize={62}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  btn: { backgroundColor: "white", padding: 10, borderRadius: 5 },
  btnText: { fontSize: 18, textAlign: "center" },
});
