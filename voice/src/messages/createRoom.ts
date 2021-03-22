import Room from "../room"
import { Rooms, SendDataFn, SocketInfo } from "../types"
import { getMediasoupWorker } from "../index"

export default async function createRoom(
  roomId: string,
  rooms: Rooms,
  socketInfo: SocketInfo
) {
  if (rooms.hasOwnProperty(roomId)) {
    socketInfo.sendData("createRoom_cb", "already exists")
  } else {
    const workerInfo = getMediasoupWorker()
    rooms[roomId] = new Room(roomId, workerInfo)
    socketInfo.sendData("createRoom_cb", roomId)

    console.log("---created room--- ", roomId)
  }
}
