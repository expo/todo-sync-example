import { EvilIcons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite/next";
import { Text, Pressable, StyleSheet } from "react-native";
import Animated, { BounceIn, SlideInRight } from "react-native-reanimated";

const AnimatedCheckmark = Animated.createAnimatedComponent(AntDesign);
const ICON_SIZE = 24;

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type TodoRowProps = {
  todo: Todo;
};

export function TodoRow({ todo: { id, text, completed } }: TodoRowProps) {
  console.log(id);
  const db = useSQLiteContext();

  const toggleTodo = async () => {
    await db.runAsync(`UPDATE todo SET completed = ? WHERE id = ?`, [
      !completed,
      id,
    ]);
  };

  const deleteRow = async () => {
    await db.runAsync(`DELETE FROM todo WHERE id = ?`, [id]);
  };

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
        <Text style={styles.title}>{text}</Text>

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
