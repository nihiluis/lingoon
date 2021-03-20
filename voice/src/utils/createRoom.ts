import { Rooms } from "../types"

interface Params {
  roomId: string
}

export default async function createRoom(roomId: string, rooms: Rooms) {
  if (roomId in rooms) {
    callback("already exists")
  } else {
    console.log("---created room--- ", room_id)
    let worker = await getMediasoupWorker()
    rooms[roomId] = 
    roomList.set(room_id, new Room(room_id, worker, wss))
    callback(room_id)
  }
}

/**
 * Get next mediasoup Worker.
 */
function getMediasoupWorker() {
  const worker = workers[nextMediasoupWorkerIdx]

  if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0

  return worker
}
