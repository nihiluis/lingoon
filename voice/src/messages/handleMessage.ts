import WebSocket from "ws"
import { SocketInfo } from "../types"
import createRoom from "./createRoom"
import getProducers from "./getProducers"
import joinRoom from "./joinRoom"
import sendData from "./sendData"

const handlers: Record<string, (data: any, fetchId?: string) => void> = {}

export default function handleMessage(socketInfo: SocketInfo) {
  const { id, socket, sendData } = socketInfo

  return function (message: string) {
    if (message === "ping") {
      socketInfo.socket.send("pong")
      return
    }

    const body = JSON.parse(message)

    const opCode = body["o"]
    const data = body["d"]
    const fetchId = body["fetchId"]

    const messageHandler = handlers[opCode]
    if (!messageHandler) {
      return
    }

    messageHandler(data, fetchId)
  }
}

export function registerMessage(
  type: string,
  fn: (data: any, fetchId?: string) => void
) {
  handlers[type] = fn
}
