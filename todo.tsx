import { EvilIcons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Text, View, Pressable, StyleSheet } from "react-native";
import Animated, { BounceIn, SlideInRight } from "react-native-reanimated";
import { RowProps, useCell } from "tinybase/lib/ui-react";

const AnimatedCheckmark = Animated.createAnimatedComponent(AntDesign);

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type TodoProps = {
  todo: Todo;
  toggleTodo: (id: number, completed: boolean) => void;
  deleteWord: (id: number) => void;
};

export function DataRow({ store, tableId, rowId }: RowProps) {
  const todo = useCell(tableId, rowId, "text", store);
  const completed = useCell(tableId, rowId, "completed", store);
  return (
    <Animated.View entering={SlideInRight}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            borderColor: completed ? "#10cc1f" : "rgba(0,0,0,.5)",
            opacity: pressed ? 0.5 : 1,
          },
        ]}
        onPress={() => {}}
      >
        <Text style={styles.title}>{todo}</Text>
        <View style={styles.status}>
          {completed ? (
            <AnimatedCheckmark
              entering={BounceIn}
              name="check"
              size={24}
              color="#10cc1f"
            />
          ) : (
            <MaterialIcons
              name="check-box-outline-blank"
              size={24}
              color="black"
            />
          )}
          <EvilIcons name="trash" size={32} color="red" onPress={() => {}} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function TodoRow({ todo, toggleTodo, deleteWord }: TodoProps) {
  return (
    <Animated.View entering={SlideInRight}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            borderColor: todo.completed ? "#10cc1f" : "rgba(0,0,0,.5)",
            opacity: pressed ? 0.5 : 1,
          },
        ]}
        onPress={() => toggleTodo(todo.id, !todo.completed)}
      >
        <Text style={styles.title}>{todo.text}</Text>
        <View style={styles.status}>
          {todo.completed ? (
            <AnimatedCheckmark
              entering={BounceIn}
              name="check"
              size={24}
              color="#10cc1f"
            />
          ) : (
            <MaterialIcons
              name="check-box-outline-blank"
              size={24}
              color="black"
            />
          )}
          <EvilIcons
            name="trash"
            size={32}
            color="red"
            onPress={() => deleteWord(todo.id)}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  title: {
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
