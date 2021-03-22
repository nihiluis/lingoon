import Room from "../room"
import { SocketInfo } from "../types"
import Peer from "../peer"

export default async function createWebRtcTransport(
  room: Room,
  peer: Peer,
  socketInfo: SocketInfo
) {
  console.log(`---create webrtc transport--- name: ${peer.id}`)
  try {
    const { params } = await room.createWebRtcTransport(peer)

    socketInfo.sendData("createWebRtcTransport_cb", params)
  } catch (ex) {
    console.error(ex)
    socketInfo.sendData("createWebRtcTransport_cb", ex.message)
  }
}
