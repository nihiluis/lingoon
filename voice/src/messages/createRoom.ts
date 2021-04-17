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
    socketInfo.sendData("createRoom_cb", { error: "already exists" }, fetchId)
  } else {
    const workerInfo = getMediasoupWorker()
    rooms[roomId] = new Room(roomId, workerInfo)
    socketInfo.sendData("createRoom_cb", { room: roomId }, fetchId)

    console.log("---created room--- ", roomId)
  }
}
