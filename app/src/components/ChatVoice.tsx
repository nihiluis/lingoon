import React, { useContext } from "react"
import { useRoomStore } from "../stores/room"
import { useUserStore } from "../stores/user"
import Icon from "./icon"
import Textarea from "./ui/controls/Textarea"
import Text from "./ui/Text"
import UserAvatar from "./UserAvatar"
import MicOnSvg from "./icon/Mic.svg"
import MicOffSvg from "./icon/MicOff.svg"
import { useMuteStore } from "../stores/mute"
import { useVoiceStore } from "../stores/voice"
import { WebSocketContext } from "./WebSocketProvider"

interface Props {}

export default function ChatVoice(props: Props) {
  const messages = []
  const ws = useContext(WebSocketContext)
  if (!ws.conn) {
    console.error("ws shouldn't be null")
    return null
  }
  const { currentVoiceRoomId, activeRoom, joinRoom } = useRoomStore(
    state => state
  )
  const user = useUserStore(state => state.activeUser)
  const {} = useVoiceStore(state => state)
  const { muted, setMuted } = useMuteStore(state => state)

  if (!activeRoom || !activeRoom.isVoice) {
    return null
  }

  if (activeRoom.id !== currentVoiceRoomId) {
    joinRoom(user, activeRoom, ws.conn)
  }

  return (
    <div className="relative min-h-full">
      <div className="absolute bottom-0 right-0 left-0 mb-2 h-24">
        <div className="rounded-lg bg-gray-400 flex p-2">
          <Icon
            Src={muted ? MicOffSvg : MicOnSvg}
            reverse
            onClick={() => setMuted(!muted)}
          />
        </div>
      </div>
    </div>
  )
}
