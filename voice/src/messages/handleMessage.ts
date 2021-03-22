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

    const type = body.type
    const data = body.data

    const messageHandler = handlers[type]
    if (!messageHandler) {
      return
    }

    messageHandler(data)
  }
}

export function registerMessage(type: string, fn: (data: any) => void) {
  handlers[type] = fn
}
