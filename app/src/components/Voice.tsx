import React from "react"
import { useRoomStore } from "../stores/room"
import { useUserStore } from "../stores/user"
import Textarea from "./ui/controls/Textarea"
import Text from "./ui/Text"
import UserAvatar from "./UserAvatar"

interface Props {}

export default function Chat(props: Props) {
  const messages = []
  const room = useRoomStore(state => state.activeRoom)
  const user = useUserStore(state => state.activeUser)

  if (!room || !room.isVoice) {
    return null
  }

  return (
    <div className="relative min-h-full">
      <div className="absolute bottom-0 right-0 left-0 mb-2 h-24">
        <div className="rounded-lg bg-white">
          
        </div>
      </div>
    </div>
  )
}
