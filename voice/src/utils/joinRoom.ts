import Peer from "../peer"
import { Rooms, SocketInfo } from "../types"

export default function joinRoom(
  roomId: string,
  rooms: Rooms,
  socketInfo: SocketInfo
) {
  console.log('---user joined--- "' + roomId + '": ' + name)

  if (!rooms.hasOwnProperty(roomId)) {
    return socketInfo.sendData("joinRoom_cb", {
      error: "room does not exist",
    })
  }

  const room = rooms[roomId]

  room.addPeer(new Peer("?", name))

  socketInfo.roomId = room.id

  socketInfo.sendData("joinRoom_cb", room.json())
}
