import { Router, Worker } from "mediasoup/lib/types"
import WebSocket from "ws"
import Peer from "./peer"
import Room from "./room"

export interface WorkerInfo {
  worker: Worker
  router: Router
}

export type SendDataFn = (type: string, data: any) => void

export interface SocketInfo {
  id: string
  socket: WebSocket
  sendData: SendDataFn
  roomId?: string
}

export type RoomPeers = Record<string, Peer>
export type Rooms = Record<string, Room>
