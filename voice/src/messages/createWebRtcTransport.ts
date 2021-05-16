import Room from "../room"
import { SocketInfo } from "../types"
import Peer from "../peer"

export default async function createWebRtcTransport(
  room: Room,
  peer: Peer,
  side: "recv" | "send",
  socketInfo: SocketInfo
) {
  console.log(`---create webrtc transport--- name: ${peer.id}`)
  try {
    const { params } = await room.createWebRtcTransport(peer, side)

    return params
  } catch (ex) {
    console.error(ex)
    return { error: ex.message }
  }
}
