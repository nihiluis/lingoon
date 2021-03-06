import WebSocket from "ws"

export default function sendData(
  socket: WebSocket,
  opCode: string,
  data: any,
  fetchId?: string
) {
  const raw = `{"op":"${fetchId ? "fetch_done" : opCode}","d":${JSON.stringify(
    data
  )}${fetchId ? `,"fetchId":"${fetchId}"` : ""}}`

  socket.send(raw)
}
