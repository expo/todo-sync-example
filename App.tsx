import "expo-dev-client";
import { initDatabase } from "./db/init";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, FlatList } from "react-native";
import { TodoRow } from "./todo";
import { useTodoList } from "./useTodoList";
import { store } from "./store";

initDatabase();

console.log(store.getValues());

export default function App() {
  const {
    todos,
    addTodo,
    syncEnabled,
    setSyncEnabled,
    deleteTodo,
    toggleStatus,
  } = useTodoList();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 60 }}>
        Todo List
      </Text>
      <Button title="Add Todo" onPress={addTodo} />
      <Button
        title={syncEnabled ? "Disable Sync" : "Enable"}
        onPress={() => setSyncEnabled((s) => !s)}
      />
      <FlatList
        data={todos}
        style={{ width: "100%" }}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <TodoRow
            todo={item}
            toggleTodo={toggleStatus}
            deleteWord={deleteTodo}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
