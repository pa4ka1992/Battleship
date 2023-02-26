import {
  sendConnect,
  sendDisconnect,
  sendReady,
  sendShoot,
  sendExit,
  sendChat,
  useReconnect,
} from "./socketHandlers/_index.js";

export class SocketService {
  constructor(wsInstance) {
    this.wsInstance = wsInstance;
    this.games = {};
    this.gameChats = {};
    this.commonChat = [];
    this.info = wsInstance.getWss();
    this.latestDate = "";
  }

  connectHandler(ws, msg) {
    sendConnect.call(this, ws, msg);
  }

  disconnectHandler(ws, msg) {
    sendDisconnect.call(this, ws, msg);
  }

  readyHandler(ws, msg) {
    sendReady.call(this, ws, msg);
  }

  shootHandler(ws, msg) {
    sendShoot.call(this, ws, msg);
  }

  exitHandler(ws, msg) {
    sendExit.call(this, ws, msg);
  }

  chatHandler(ws, msg) {
    sendChat.call(this, ws, msg);
  }

  reconnect(game, ws, user, msg) {
    useReconnect.call(this, game, ws, user, msg);
  }

  connectBroadcast(ws, msg) {
    const { gameId } = ws.game;

    this.info.clients.forEach((client) => {
      if (msg.method === "chat") {
        console.log("chat");
        client.send(JSON.stringify(msg));
      }

      if (client.game.gameId === gameId) {
        if (msg.method !== "chat") {
          client.send(JSON.stringify(msg));
        }

        if (msg.method === "exit") {
          client.game = {};
        }
      }
    });
  }

  messageApplier(key, value, msg, wss) {
    msg[key] = wss.game[key] = value;
  }

  mailing(ws, chat) {
    const chatContent =
      chat === "common" ? this.commonChat : this.gameChats[ws.game.gameId];
    const msg = {
      method: "mailing",
      chatName: chat,
      chatMessage: chatContent,
    };

    ws.send(JSON.stringify(msg));
  }
}
