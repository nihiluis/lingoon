import WebSocket from "ws"

export default function sendData(socket: WebSocket, type: string, data: any) {
  socket.send(JSON.stringify({ type, data }))
}
