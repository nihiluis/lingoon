import WebSocket from "ws"
import { SocketInfo } from "../types"
import createRoom from "./createRoom"
import getProducers from "./getProducers"
import joinRoom from "./joinRoom"
import sendData from "./sendData"

const handlers: Record<string, (data: any) => void> = {}

export default function handleMessage(socketInfo: SocketInfo) {
  const { id, socket, sendData } = socketInfo

  return function (message: string) {
    const body = JSON.parse(message)

    const opCode = body["o"]
    const data = body["d"]
    const fetchId = body["fetchId"]

    const messageHandler = handlers[opCode]
    if (!messageHandler) {
      return
    }

    messageHandler(data)
  }
}

export function registerMessage(type: string, fn: (data: any) => void) {
  handlers[type] = fn
}
