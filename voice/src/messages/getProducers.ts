import Room from "../room"
import { Rooms, SendDataFn, SocketInfo } from "../types"
import { getMediasoupWorker } from "../index"
import Peer from "../peer"

export default async function getProducers(
  room: Room,
  peer: Peer,
  socketInfo: SocketInfo
) {
  console.log(`---get producers--- name:${peer.id}`)

  const producerList = room.getProducerList()

  socketInfo.sendData("newProducers", producerList)
}
