import React from "react"
import { useRoomStore } from "../stores/room"
import { useUserStore } from "../stores/user"
import Avatar from "./ui/Avatar"
import Input from "./ui/controls/Input"
import Textarea from "./ui/controls/Textarea"
import Text from "./ui/Text"
import UserAvatar from "./UserAvatar"

interface Props {}

export default function Chat(props: Props) {
  const messages = []
  const room = useRoomStore(state => state.activeRoom)
  const user = useUserStore(state => state.activeUser)

  return (
    <div className="relative min-h-full">
      {messages.length === 0 && <Text text="Nothing lives here yet." />}
      <div className="absolute bottom-0 right-0 left-0 mb-2 h-24">
        <Textarea
          name="chat"
          value=""
          placeholder={`Message #${room?.name ?? "Invalid"}`}
        />
        <div className="flex mt-1">
          <UserAvatar user={user} className="mr-2" />
        </div>
      </div>
    </div>
  )
}
