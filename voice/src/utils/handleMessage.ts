import WebSocket from "ws"
import { SocketInfo } from "../types"
import createRoom from "./createRoom"
import sendData from "./sendData"


export default function handleMessage(socketInfo: SocketInfo) {
  const { id, socket, sendData } = socketInfo

  return function (message: string) {
    const body = JSON.parse(message)

    const type = body.type
    const data = body.data

    switch (type) {
      case "createRoom":
        createRoom(data.roomId, {}, sendData)
        break
      case "join":
        break
    }
  }
}
