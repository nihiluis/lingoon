import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/router"
import connectToSocket, { WsConnection } from "../lib/ws"
import { User } from "../@types/user"
import { API_BASE_URL } from "../lib/constants"
import { useRoomStore } from "../stores/room"
import { useMuteStore } from "../stores/mute"
import { useVoiceStore } from "../stores/voice"

interface WebSocketProviderProps {
  shouldConnect: boolean
}

type V = WsConnection | null

export const WebSocketContext = React.createContext<{
  conn: V
  setUser: (u: User) => void
  setConn: (u: WsConnection | null) => void
}>({
  conn: null,
  setUser: () => {},
  setConn: () => {},
})

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  shouldConnect,
  children,
}) => {
  const [conn, setConn] = useState<V>(null)
  const { replace } = useRouter()
  const isConnecting = useRef(false)

  useEffect(() => {
    if (!conn && shouldConnect && !isConnecting.current) {
      isConnecting.current = true
      connectToSocket({
        url: API_BASE_URL.replace("http", "ws"),
        getOptions: () => {
          const muted = useMuteStore(state => state.muted)
          const currentRoomId = useRoomStore.getState().currentVoiceRoomId
          const { recvTransport, sendTransport } = useVoiceStore.getState()

          const reconnectToVoice = !recvTransport
            ? true
            : recvTransport.connectionState !== "connected" &&
              sendTransport?.connectionState !== "connected"

          console.log({
            reconnectToVoice,
            recvState: recvTransport?.connectionState,
            sendState: sendTransport?.connectionState,
          })

          return {
            reconnectToVoice,
            room: currentRoomId,
            muted: muted,
          }
        },
        onConnectionTaken: () => {
          // the index page nulls the conn
          // if you switch this, make sure to null the conn at the new location
          replace("/")
          // @todo do something better
          //showErrorToast("You can only have 1 tab of DogeHouse open at a time")
        },
      })
        .then(conn => {
          setConn(conn)
          if (conn.initialCurrentRoomId) {
            useRoomStore(state => state.setVoiceRoomIdIfEmpty)(
              conn.initialCurrentRoomId
            )
          }
        })
        .catch(err => {
          if (err.code === 4001) {
            replace(`/?next=${window.location.pathname}`)
          }
        })
        .finally(() => {
          isConnecting.current = false
        })
    }
  }, [conn, shouldConnect, replace])

  return (
    <WebSocketContext.Provider
      value={useMemo(
        () => ({
          conn,
          setConn,
          setUser: (u: User) => {
            if (conn) {
              setConn({
                ...conn,
                user: u,
              })
            }
          },
        }),
        [conn]
      )}>
      {children}
    </WebSocketContext.Provider>
  )
}
