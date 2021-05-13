import Room from "../room"
import { Rooms, SendDataFn, SocketInfo } from "../types"
import { getMediasoupWorker } from "../index"

export default async function createRoom(
  roomId: string,
  rooms: Rooms,
  socketInfo: SocketInfo,
  fetchId?: string
) {
  if (rooms.hasOwnProperty(roomId)) {
    return { error: "already exists" }
  } else {
    const workerInfo = getMediasoupWorker()
    rooms[roomId] = new Room(roomId, workerInfo)

    console.log("---created room--- ", roomId)

    return { roomId }
  }
}
