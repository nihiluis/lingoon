import WebSocket from "isomorphic-ws"
import ReconnectingWebSocket from "reconnecting-websocket"
import { v4 as generateUuid } from "uuid"
import { User } from "../@types/user"

const heartbeatInterval = 8000
const apiUrl = "wss://localhost:3001"
const connectionTimeout = 15000

export type OpCode = string
export type FetchId = string

export type ListenerHandler<Data = unknown> = (
  data: Data,
  fetchId?: FetchId
) => void
export type Listener<Data = unknown> = {
  opcode: OpCode
  handler: ListenerHandler<Data>
}

export type Connection = {
  close: () => void
  once: <Data = unknown>(opcode: OpCode, handler: ListenerHandler<Data>) => void
  addListener: <Data = unknown>(
    opcode: OpCode,
    handler: ListenerHandler<Data>
  ) => () => void
  user: User
  initialCurrentRoomId?: string
  send: (opcode: OpCode, data: unknown, fetchId?: FetchId) => void
  fetch: (
    opcode: OpCode,
    data: unknown,
    doneOpCode?: OpCode
  ) => Promise<unknown>
}

export default function connect({
  onConnectionTaken = () => {},
  onClearTokens = () => {},
  url = apiUrl,
  options,
  fetchTimeout,
}: {
  onConnectionTaken?: () => void
  onClearTokens?: () => void
  url?: string
  getOptions: () => {
    muted: boolean
    room: string
  }
  fetchTimeout?: number
}) {
  return new Promise((resolve, reject) => {
    const socket = new ReconnectingWebSocket(url, [], {
      connectionTimeout,
      WebSocket,
    })

    const apiSend = (opcode: OpCode, data: unknown, fetchId?: FetchId) => {
      const raw = `{"op":"${opcode}","d":${JSON.stringify(data)}${
        fetchId ? `,"fetchId":"${fetchId}"` : ""
      }}`

      socket.send(raw)
    }

    const listeners: Listener[] = []

    // close & message listener needs to be outside of open
    // this prevents multiple listeners from being created on reconnect
    socket.addEventListener("close", error => {
      if (error.code === 4001) {
        socket.close()
        onClearTokens()
      } else if (error.code === 4003) {
        socket.close()
        onConnectionTaken()
      } else if (error.code === 4004) {
        socket.close()
        onClearTokens()
      }
      reject(error)
    })

    socket.addEventListener("message", e => {
      if (e.data === `"pong"`) {
        return
      }

      const message = JSON.parse(e.data)

      if (message.op === "auth-success") {
        const connection: Connection = {
          close: () => socket.close(),
          once: (opcode, handler) => {
            const listener = { opcode, handler } as Listener<unknown>

            listener.handler = (...params) => {
              handler(...(params as Parameters<typeof handler>))
              listeners.splice(listeners.indexOf(listener), 1)
            }

            listeners.push(listener)
          },
          addListener: (opcode, handler) => {
            const listener = { opcode, handler } as Listener<unknown>

            listeners.push(listener)

            return () => listeners.splice(listeners.indexOf(listener), 1)
          },
          user: message.d.user,
          initialCurrentRoomId: message.d.currentRoom?.id,
          send: apiSend,
          fetch: (opcode: OpCode, parameters: unknown, doneOpCode?: OpCode) =>
            new Promise((resolveFetch, rejectFetch) => {
              const fetchId: FetchId | false = !doneOpCode && generateUuid()
              let timeoutId: NodeJS.Timeout | null = null
              const unsubscribe = connection.addListener(
                doneOpCode ?? "fetch_done",
                (data, arrivedId) => {
                  if (!doneOpCode && arrivedId !== fetchId) return

                  if (timeoutId) clearTimeout(timeoutId)

                  unsubscribe()
                  resolveFetch(data)
                }
              )

              if (fetchTimeout) {
                timeoutId = setTimeout(() => {
                  unsubscribe()
                  rejectFetch(new Error("timed out"))
                }, fetchTimeout)
              }

              apiSend(opcode, parameters, fetchId || undefined)
            }),
        }

        resolve(connection)
      } else {
        listeners
          .filter(({ opcode }) => opcode === message.op)
          .forEach(it => it.handler(message.d, message.fetchId))
      }
    })

    socket.addEventListener("open", () => {
      const id = setInterval(() => {
        if (socket.readyState === socket.CLOSED) {
          clearInterval(id)
        } else {
          socket.send("ping")
        }
      }, heartbeatInterval)

      apiSend("auth", {
        reconnectToVoice: false,
        currentRoomId: null,
        muted: false,
      })
    })
  })
}
