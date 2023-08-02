import { EvilIcons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Text, View, Pressable, StyleSheet } from "react-native";
import Animated, { BounceIn, SlideInRight } from "react-native-reanimated";
import {
  RowProps,
  useCell,
  useDelRowCallback,
  useSetCellCallback,
} from "tinybase/lib/ui-react";

const AnimatedCheckmark = Animated.createAnimatedComponent(AntDesign);

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export function TodoRow({ tableId, rowId }: RowProps) {
  const todo = useCell(tableId, rowId, "text");
  const completed = useCell(tableId, rowId, "completed");

  const toggleTodo = useSetCellCallback(
    tableId,
    rowId,
    "completed",
    () => (completed === 0 ? 1 : 0),
    [completed]
  );

  const deleteRow = useDelRowCallback(tableId, rowId);

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
        onPress={toggleTodo}
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
          <EvilIcons name="trash" size={32} color="red" onPress={deleteRow} />
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
