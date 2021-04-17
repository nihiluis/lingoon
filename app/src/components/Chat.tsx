import React from "react"
import { useRoomStore } from "../stores/room"
import ChatText from "./ChatText"
import ChatVoice from "./ChatVoice"

export default function Chat() {
  const room = useRoomStore(state => state.activeRoom)
  if (!room) {
    return null
  }

  return room.isVoice ? <ChatVoice /> : <ChatText />
}
