import { DtlsParameters, MediaKind, RtpParameters } from "mediasoup/lib/types"
import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default async function produce(
  room: Room,
  peer: Peer,
  producerTransportId: string,
  rtpParameters: RtpParameters,
  kind: MediaKind,
  socketInfo: SocketInfo
) {
  const producerId = await room.createProducer(
    peer,
    producerTransportId,
    rtpParameters,
    kind
  )

  room.broadcast(peer, "speaker-joined", [
    {
      producerId: producerId,
      peerId: peer.id,
    },
  ])

  console.log("sending you-joined")
  socketInfo.sendData("you-joined", {
    roomId: room.id,
    peerId: peer.id,
    producerId,
  })

  console.log(`---produce--- type: ${kind} name: ${peer.id} id: ${producerId}`)

  return {
    producerId,
  }
}
