let previousMessage = null;

export default {
  onConnect(websocket, room) {
    if (previousMessage) {
      websocket.send(previousMessage);
    }

    websocket.addEventListener("message", (event) => {
      const message = event.data;

      if (event.data === 'init') {
        websocket.send(previousMessage);
      } else {
        room.broadcast(message.toString());
        previousMessage = message.toString();
      }
    });
  }
}