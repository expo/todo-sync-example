import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "./db/init";
import { Todo } from "./todo";
import { generateRandomTodo } from "./utils";

export function useTodoList() {
  const ws = useRef(new WebSocket(`ws://localhost:3000`)).current;
  const [todos, setTodos] = useState<Todo[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(true);

  const fetchTodos = useCallback(() => {
    db.exec(
      [{ sql: "SELECT * FROM todo", args: [] }],
      false,
      false,
      (_, res) => {
        // @ts-ignore
        setTodos(res[0].rows.sort(sortTodos));
      }
    );
  }, []);

  const addTodo = useCallback(() => {
    db.exec(
      [
        {
          sql: "INSERT INTO todo (id, text, completed) VALUES (?, ?, ?)",
          args: [Math.random() * 10000, generateRandomTodo(), false],
        },
      ],
      false,
      syncEnabled,
      () => {
        fetchTodos();
      }
    );
  }, []);

  const toggleStatus = useCallback((id: number, completed: boolean) => {
    db.exec(
      [
        {
          sql: "UPDATE todo SET completed = ? WHERE id = ?",
          args: [completed, id],
        },
      ],
      false,
      syncEnabled,
      () => {
        fetchTodos();
      }
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    db.exec(
      [
        {
          sql: "DELETE FROM todo WHERE id = ?",
          args: [id],
        },
      ],
      false,
      syncEnabled,
      () => {
        fetchTodos();
      }
    );
  }, []);

  useEffect(() => {
    ws.onopen = () => {
      fetchTodos();
    };

    ws.onmessage = (e) => {
      if (!syncEnabled) return;
      const data = JSON.parse(e.data);
      const rows = data[0].rows;

      for (const row of rows) {
        const { pk, ...rest } = row;
        const sql = `INSERT INTO crsql_changes ("table", 'pk', 'cid', 'val', 'col_version', 'db_version', 'site_id') VALUES (?, ${pk}, ?, ?, ?, ?, ?)`;
        db.exec(
          [
            {
              sql,
              args: Object.values(rest),
            },
          ],
          false,
          false,
          () => {}
        );
      }

      fetchTodos();
    };
  }, [syncEnabled]);

  useEffect(() => {
    const sub = db.onDatabaseChange((_, changes) => {
      ws.send(JSON.stringify(changes));
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = db.onSqliteUpdate((result) => {
      console.log({ result });
    });

    return () => sub.remove();
  }, []);

  return {
    todos,
    addTodo,
    toggleStatus,
    deleteTodo,
    syncEnabled,
    setSyncEnabled,
  };
}

function sortTodos(a: Todo, b: Todo) {
  if (a.text < b.text) {
    return -1;
  } else if (a.text > b.text) {
    return 1;
  } else {
    return 0;
  }
}
