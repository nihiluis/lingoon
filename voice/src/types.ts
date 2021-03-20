import { Router, Worker } from "mediasoup/lib/types"
import Peer from "./peer"
import Room from "./room"

export interface WorkerInfo {
  worker: Worker
  router: Router
}

export type RoomPeers = Record<string, Peer>
export type Rooms = Record<string, Room>
