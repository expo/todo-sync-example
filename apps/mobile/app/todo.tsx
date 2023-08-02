import { EvilIcons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Text, Pressable, StyleSheet } from "react-native";
import Animated, { BounceIn, SlideInRight } from "react-native-reanimated";
import {
  RowProps,
  useCell,
  useDelRowCallback,
  useSetCellCallback,
} from "tinybase/lib/ui-react";

const AnimatedCheckmark = Animated.createAnimatedComponent(AntDesign);
const ICON_SIZE = 24;

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
        {completed ? (
          <AnimatedCheckmark
            entering={BounceIn}
            name="check"
            size={ICON_SIZE}
            color="#10cc1f"
          />
        ) : (
          <MaterialIcons
            name="check-box-outline-blank"
            size={ICON_SIZE}
            color="black"
          />
        )}
        <Text style={styles.title}>{todo}</Text>

        <EvilIcons name="trash" size={32} color="red" onPress={deleteRow} />
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
    borderWidth: 2,
    backgroundColor: "white",
    gap: 10,
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
