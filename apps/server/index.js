let previousMessage = null;

export default {
  onConnect(websocket, room) {
    websocket.addEventListener("message", (event) => {
      const message = event.data;

      if (event.data === 'init') {
        if (previousMessage) {
          websocket.send(previousMessage);
        }
      } else {
        room.broadcast(message.toString());
        previousMessage = message.toString();
      }
    });
  }
}