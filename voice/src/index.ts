import express from "express"
import * as http from "http"
import ws from "ws"
import * as path from "path"

import config from "./config"
import * as uuid from "uuid"
import Room from "./room"
import Peer from "./peer"
import handleMessage, { registerMessage } from "./messages/handleMessage"
import startMediasoup from "./messages/startMediasoup"
import { Rooms, SocketInfo, WorkerInfo } from "./types"
import sendData from "./messages/sendData"
import createRoom from "./messages/createRoom"
import joinRoom from "./messages/joinRoom"
import getProducers from "./messages/getProducers"
import getRouterRtpCapabilities from "./messages/getRouterRtpCapabilities"
import createWebRtcTransport from "./messages/createWebRtcTransport"
import {
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
} from "mediasoup/lib/types"
import connectTransport from "./messages/connectTransport"
import produce from "./messages/produce"
import consume from "./messages/consume"

const app = express()

const httpServer = http.createServer(app)
const wss = new ws.Server({ server: httpServer })

app.use(express.static(path.join(__dirname, "..", "public")))

httpServer.listen(config.listenPort, () => {
  console.log("listening http " + config.listenPort)
})

let nextMediasoupWorkerIdx = 0

let workers: WorkerInfo[] = []
const rooms: Rooms = {}

/**
 * Get next mediasoup Worker.
 */
export function getMediasoupWorker() {
  const worker = workers[nextMediasoupWorkerIdx]

  if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0

  return worker
}

async function main() {
  workers = await startMediasoup()

  wss.on("connection", ws => {
    function sendDataWrapper(opCode: string, data: any, fetchId?: string) {
      sendData(ws, opCode, data, fetchId)
    }

    const socketInfo: SocketInfo = {
      id: uuid.v4(),
      socket: ws,
      sendData: sendDataWrapper,
    }

    ws.on("message", handleMessage(socketInfo))

    function getRoomFromData({ roomId }: { roomId?: string }): Room | null {
      if (!roomId) {
        return null
      }

      if (!rooms.hasOwnProperty(roomId)) {
        socketInfo.sendData("joinRoom_cb", {
          error: "room does not exist",
        })
        return null
      }

      return rooms[roomId]
    }
    function getPeer(room: Room): Peer | null {
      return room.peers[socketInfo.id]
    }

    registerMessage("createRoom", (data, fetchId) => {
      const roomId: string = data.roomId

      createRoom(roomId, rooms, socketInfo, fetchId)
    })
    registerMessage("joinRoom", (data, fetchId) => {
      const room = getRoomFromData(data)
      if (!room) {
        return
      }

      joinRoom(room, socketInfo, fetchId)
    })
    registerMessage("getProducers", data => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }

      getProducers(room, peer, socketInfo)
    })
    registerMessage("getRouterRtpCapabilities", data => {
      const room = getRoomFromData(data)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }
      getRouterRtpCapabilities(room, peer, socketInfo)
    })
    registerMessage("createWebRtcTransport", data => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }

      createWebRtcTransport(room, peer, socketInfo)
    })

    registerMessage("connectTransport", data => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }

      const transportId: string = data.transportId
      const dtlsParameters: DtlsParameters = data.dtlsParameters

      if (!room || !peer || !transportId || !dtlsParameters) {
        return
      }

      connectTransport(room, peer, transportId, dtlsParameters, socketInfo)
    })

    registerMessage("produce", data => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }
      const producerTransportId: string = data.producerTransportId
      const rtpParameters: RtpParameters = data.rtpParameters
      const kind: MediaKind = data.kind

      if (!room || !peer || !producerTransportId || !rtpParameters || !kind) {
        return
      }

      produce(room, peer, producerTransportId, rtpParameters, kind, socketInfo)
    })

    registerMessage("consume", data => {
      const room = getRoomFromData(data)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }
      const consumerTransportId: string = data.consumerTransportId
      const producerId: string = data.producerId
      const rtpCapabilities: RtpCapabilities = data.rtpCapabilities

      if (
        !room ||
        !peer ||
        !consumerTransportId ||
        !rtpCapabilities ||
        !producerId
      ) {
        return
      }

      consume(
        room,
        peer,
        consumerTransportId,
        producerId,
        rtpCapabilities,
        socketInfo
      )
    })

    /**
    registerMessage("resume", async data => {
      await consumer.resume()
    })
     */

    registerMessage("auth", data => {
      const user: string = data.user
      console.log(`receiving auth request from ${user}`)
      socketInfo.sendData("auth_success", { user })
    })

    registerMessage("getMyRoomInfo", () => {
      if (!socketInfo.roomId) {
        socketInfo.sendData("getMyRoomInfo_cb", { error: "not work" })
      }
      const room = rooms[socketInfo.roomId!]

      socketInfo.sendData("getMyRoomInfo_cb", room.json())
    })

    registerMessage("disconnect", () => {
      if (!socketInfo.roomId) {
        socketInfo.sendData("getMyRoomInfo_cb", { error: "not work" })
      }
      const room = rooms[socketInfo.roomId!]

      if (!room) {
        return
      }

      const peer = getPeer(room)
      if (!peer) {
        return
      }

      console.log(`---disconnect--- name: ${room && peer?.id}`)

      room.removePeer(peer)
    })

    registerMessage("producerClosed", data => {
      const producerId: string = data.producerId

      if (!socketInfo.roomId) {
        return
      }

      const room = rooms[socketInfo.roomId]
      if (!room) {
        return
      }

      const peer = getPeer(room)
      if (!peer) {
        return
      }

      console.log(`---producer close--- name: ${peer.id}`)

      room.closeProducer(peer, producerId)
    })

    ws.on("exitRoom", async (_, callback) => {})
  })
}

main()
