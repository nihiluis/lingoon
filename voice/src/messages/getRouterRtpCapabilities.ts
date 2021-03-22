import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default async function getRouterRtpCapabilities(
  room: Room,
  peer: Peer,
  socketInfo: SocketInfo
) {
  console.log(
    `---get RouterRtpCapabilities--- id: ${peer.id}`
  )

  try {
    socketInfo.sendData("getProducers_cb", room.getRtpCapabilities())
  } catch (ex) {
    socketInfo.sendData("getProducers_cb", ex.message)
  }
}
