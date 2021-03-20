import WebSocket from "ws"
import createRoom from "./createRoom"

export default function handleMessage(this: WebSocket, message: string) {
  const body = JSON.parse(message)

  const type = body.type
  const data = body.data

  switch (type) {
    case "createRoom":
      createRoom(data.roomId, {})
      break
  }
}
