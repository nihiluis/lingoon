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
  console.log(`---produce--- type: ${kind} name: ${peer.id} id: ${producerId}`)

  socketInfo.sendData("produce_cb", {
    producerId: producerId,
  })
}
