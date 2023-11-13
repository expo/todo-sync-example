import { createStore } from "tinybase";

export const store = createStore().setTablesSchema({
  todo: {
    id: { type: "number" },
    text: { type: "string" },
    completed: { type: "number", default: 0 },
  },
});
