import { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/lib/types"
import Peer from "../peer"
import Room from "../room"
import { Rooms, SocketInfo } from "../types"

export default async function consume(
  room: Room,
  peer: Peer,
  consumerTransportId: string,
  producerId: string,
  rtpCapabilities: RtpCapabilities,
  socketInfo: SocketInfo
) {
  let params = await room.consume(
    peer,
    consumerTransportId,
    producerId,
    rtpCapabilities
  )

  console.log(
    `---consuming--- name: ${
      room && peer.id
    } prod_id:${producerId} consumer_id:${params.id}`
  )
  socketInfo.sendData("consume_cb", params)
}
