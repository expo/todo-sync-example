import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let previousMessage = null;

wss.on("connection", function connection(ws) {
  // Send previous message to new connections to seed initial state
  if (previousMessage) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(previousMessage);
      }
    });
  }

  ws.on("message", function incoming(message) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
        previousMessage = message.toString();
      }
    });
  });
});

server.listen(PORT, () =>
  console.log(`Server listening at http://localhost:${PORT}`)
);
