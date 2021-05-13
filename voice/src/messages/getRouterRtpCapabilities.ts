import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default async function getRouterRtpCapabilities(
  room: Room,
  peer: Peer,
  socketInfo: SocketInfo,
  fetchId?: string
) {
  console.log(`---get RouterRtpCapabilities--- id: ${peer.id}`)

  try {
    return room.getRtpCapabilities()
  } catch (ex) {
    return { error: ex.message }
  }
}
