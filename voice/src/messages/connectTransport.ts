import { DtlsParameters } from "mediasoup/lib/types"
import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default async function connectTransport(
  room: Room,
  peer: Peer,
  transportId: string,
  dtlsParameters: DtlsParameters,
  socketInfo: SocketInfo
) {
  console.log(
    `---connect transport--- name: ${
      peer.id
    }`
  )
  await room.connectPeerTransport(peer, transportId, dtlsParameters)

  socketInfo.sendData("connectTransport_cb", "success")
}
