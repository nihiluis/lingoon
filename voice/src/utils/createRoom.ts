import Room from "../room"
import { Rooms } from "../types"
import { getMediasoupWorker } from "../index"
import { SendDataFn } from "./handleMessage"

interface Params {
  roomId: string
}

export default async function createRoom(
  roomId: string,
  rooms: Rooms,
  send: SendDataFn
) {
  if (rooms.hasOwnProperty(roomId)) {
    send("createRoom_cb", "already exists")
  } else {
    const workerInfo = getMediasoupWorker()
    rooms[roomId] = new Room(roomId, workerInfo)
    send("createRoom_cb", roomId)

    console.log("---created room--- ", roomId)
  }
}
