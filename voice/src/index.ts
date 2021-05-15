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

    registerMessage("createRoom", async (data, fetchId) => {
      const roomId: string = data.roomId

      const responseData = await createRoom(roomId, rooms, socketInfo, fetchId)
      socketInfo.sendData("", responseData, fetchId)
    })
    registerMessage("joinRoom", async (data, fetchId) => {
      const room = getRoomFromData(data)
      if (!room) {
        return
      }

      const responseData = await joinRoom(room, socketInfo, fetchId)
      socketInfo.sendData("", responseData, fetchId)
    })
    registerMessage("getProducers", async (data, fetchId) => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }

      const responseData = await getProducers(room, peer, socketInfo)
      socketInfo.sendData("", responseData, fetchId)
    })
    registerMessage("getRouterRtpCapabilities", async (data, fetchId) => {
      const room = getRoomFromData(data)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }
      const responseData = await getRouterRtpCapabilities(
        room,
        peer,
        socketInfo
      )
      socketInfo.sendData("", responseData, fetchId)
    })
    registerMessage("createWebRtcTransport", async (data, fetchId) => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }

      const responseData = await createWebRtcTransport(room, peer, socketInfo)
      socketInfo.sendData("", responseData, fetchId)
    })

    registerMessage("connectTransport", async (data, fetchId) => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const peer = getPeer(room)

      if (!peer) {
        return
      }

      const transportId: string = data.transportId
      const side: "recv" | "send" = data.side
      const dtlsParameters: DtlsParameters = data.dtlsParameters

      if (!room || !peer || !transportId || !dtlsParameters) {
        return
      }

      await connectTransport(
        room,
        peer,
        side,
        transportId,
        dtlsParameters,
        socketInfo
      )

      socketInfo.sendData("", "success", fetchId)
    })

    registerMessage("produce", async (data, fetchId) => {
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

      const responseData = await produce(
        room,
        peer,
        producerTransportId,
        rtpParameters,
        kind,
        socketInfo
      )
      socketInfo.sendData("", responseData, fetchId)
    })

    registerMessage("recv-tracks", async (data, fetchId) => {
      const room = getRoomFromData(socketInfo)
      if (!room) {
        return
      }
      const myPeer = getPeer(room)

      if (!myPeer) {
        return
      }

      const consumerParametersArr = []

      for (const theirPeerId of Object.keys(room.getPeers())) {
        const peerState = room.peers[theirPeerId]
        peerState
        if (theirPeerId === myPeer.id || !peerState || !peerState.producer) {
          continue
        }
      }
      myPeer._transports
    })

    registerMessage("consume", async (data, fetchId) => {
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

      const responseData = await consume(
        room,
        peer,
        consumerTransportId,
        producerId,
        rtpCapabilities,
        socketInfo
      )

      socketInfo.sendData("", responseData, fetchId)
    })

    /**
    registerMessage("resume", async data => {
      await consumer.resume()
    })
     */

    registerMessage("auth", (data, fetchId) => {
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

    registerMessage("producerClosed", (data, fetchId) => {
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
