import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default function joinRoom(
  room: Room,
  socketInfo: SocketInfo,
  fetchId?: string
) {
  console.log('---user joined--- "' + room.id + '": ' + socketInfo.id)

  room.addPeer(new Peer(socketInfo.id, socketInfo.socket))

  socketInfo.roomId = room.id

  socketInfo.sendData("joinRoom_success", {}, fetchId)
}
