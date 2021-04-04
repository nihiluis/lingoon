import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/router"
import connectToSocket, { Connection } from "../lib/ws"
import { User } from "../@types/user"
import { API_BASE_URL } from "../lib/constants"
import { useRoomStore } from "../stores/room"
import { useMuteStore } from "../stores/mute"

interface WebSocketProviderProps {
  shouldConnect: boolean
}

type V = Connection | null

export const WebSocketContext = React.createContext<{
  conn: V
  setUser: (u: User) => void
  setConn: (u: Connection | null) => void
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
          const { activeRoom } = useRoomStore.getState()
          const { muted } = useMuteStore.getState()
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
            room: activeRoom?.id ?? "",
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
        .then(x => {
          setConn(x)
          if (x.initialCurrentRoomId) {
            useCurrentRoomIdStore
              .getState()
              // if an id exists already, that means they are trying to join another room
              // just let them join the other room rather than overwriting it
              .setCurrentRoomId(id => id || x.initialCurrentRoomId!)
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
  }, [conn, shouldConnect, hasTokens, replace])

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
