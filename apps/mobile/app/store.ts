import { createStore } from "tinybase";

export const store = createStore().setTablesSchema({
  todo: {
    id: { type: "string" },
    text: { type: "string" },
    completed: { type: "number", default: 0 },
  },
});
