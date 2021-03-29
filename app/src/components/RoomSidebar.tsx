import React from "react"
import { Room } from "../@types/room"
import { cx } from "../lib/reexports"
import { useRoomStore } from "../stores/room"
import ErrorText from "./ui/ErrorText"
import Line from "./ui/Line"
import MarginY from "./ui/MarginY"
import Text from "./ui/Text"

interface Props {}

export default function RoomSidebar(props: Props) {
  const rooms = useRoomStore(state => state.rooms)

  return (
    <div className="px-2 mt-2">
      <Text text="Rooms" className="px-1" />
      <Line />
      <MarginY amount={2} />
      {rooms.length === 0 && <ErrorText text="No rooms found." />}
      {rooms.map(room => (
        <RoomItem key={`room-${room.id}`} room={room} />
      ))}
    </div>
  )
}

interface RoomProps {
  room: Room
}

function RoomItem(props: RoomProps) {
  const { room } = props

  const { activeRoom, setActiveRoom } = useRoomStore(state => state)

  const isSelf = room.id === activeRoom?.id

  const classes = cx("px-1 mb-1", { "bg-gray-200": isSelf, rounded: isSelf })

  return (
    <div className={classes} onClick={() => setActiveRoom(room)}>
      <p>#{room.name}</p>
    </div>
  )
}
