import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default async function exitRoom(
  room: Room,
  rooms: Rooms,
  peer: Peer,
  socketInfo: SocketInfo
) {
  console.log(`---exit room--- name: ${peer.id}`)

  // close transports
  await room.removePeer(peer)
  if (Object.values(room.peers).length === 0) {
    delete rooms[room.id]
  }

  socketInfo.roomId = null

  socketInfo.sendData("exitRoom_cb", "successfully exited room")
}
