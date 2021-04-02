import WebSocket from "isomorphic-ws"
import ReconnectingWebSocket from "reconnecting-websocket";

const heartbeatInterval = 8000;
const url = "wss://api.dogehouse.tv/socket";
const connectionTimeout = 15000;

export const socket = new ReconnectingWebSocket(url, [], {
  connectionTimeout,
  WebSocket,
});
