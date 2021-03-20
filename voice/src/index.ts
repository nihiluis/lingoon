import express from "express"
import * as http from "http"
import ws from "ws"
import mediasoup from "mediasoup"
import * as path from "path"

import config from "./config"
import Room from "./room"
import Peer from "./peer"
import handleMessage from "./utils/handleMessage"
import startMediasoup from "./utils/startMediasoup"
import { WorkerInfo } from "./types"

const app = express()

const httpServer = http.createServer(app)
const wss = new ws.Server({ server: httpServer })

app.use(express.static(path.join(__dirname, "..", "public")))

httpServer.listen(config.listenPort, () => {
  console.log("listening http " + config.listenPort)
})

let nextMediasoupWorkerIdx = 0

const workers: WorkerInfo[] = []
const rooms = {}

async function main() {
  const workers = await startMediasoup()

  wss.on("connection", ws => {
    ws.on("message", handleMessage)
    ws.on("createRoom")

    ws.on("join", ({ room_id, name }, cb) => {
      console.log('---user joined--- "' + room_id + '": ' + name)
      if (!roomList.has(room_id)) {
        return cb({
          error: "room does not exist",
        })
      }
      roomList.get(room_id).addPeer(new Peer(ws.id, name))
      ws.room_id = room_id

      cb(roomList.get(room_id).toJson())
    })

    ws.on("getProducers", () => {
      console.log(
        `---get producers--- name:${
          roomList.get(ws.room_id).getPeers().get(ws.id).name
        }`
      )
      // send all the current producer to newly joined member
      if (!roomList.has(ws.room_id)) return
      let producerList = roomList.get(ws.room_id).getProducerListForPeer(ws.id)

      ws.emit("newProducers", producerList)
    })

    ws.on("getRouterRtpCapabilities", (_, callback) => {
      console.log(
        `---get RouterRtpCapabilities--- name: ${
          roomList.get(ws.room_id).getPeers().get(ws.id).name
        }`
      )
      try {
        callback(roomList.get(ws.room_id).getRtpCapabilities())
      } catch (e) {
        callback({
          error: e.message,
        })
      }
    })

    ws.on("createWebRtcTransport", async (_, callback) => {
      console.log(
        `---create webrtc transport--- name: ${
          roomList.get(ws.room_id).getPeers().get(ws.id).name
        }`
      )
      try {
        const { params } = await roomList
          .get(ws.room_id)
          .createWebRtcTransport(ws.id)

        callback(params)
      } catch (err) {
        console.error(err)
        callback({
          error: err.message,
        })
      }
    })

    ws.on(
      "connectTransport",
      async ({ transport_id, dtlsParameters }, callback) => {
        console.log(
          `---connect transport--- name: ${
            roomList.get(ws.room_id).getPeers().get(ws.id).name
          }`
        )
        if (!roomList.has(ws.room_id)) return
        await roomList
          .get(ws.room_id)
          .connectPeerTransport(ws.id, transport_id, dtlsParameters)

        callback("success")
      }
    )

    ws.on(
      "produce",
      async ({ kind, rtpParameters, producerTransportId }, callback) => {
        if (!roomList.has(ws.room_id)) {
          return callback({ error: "not is a room" })
        }

        let producer_id = await roomList
          .get(ws.room_id)
          .produce(ws.id, producerTransportId, rtpParameters, kind)
        console.log(
          `---produce--- type: ${kind} name: ${
            roomList.get(ws.room_id).getPeers().get(ws.id).name
          } id: ${producer_id}`
        )
        callback({
          producer_id,
        })
      }
    )

    ws.on(
      "consume",
      async (
        { consumerTransportId, producerId, rtpCapabilities },
        callback
      ) => {
        //TODO null handling
        let params = await roomList
          .get(ws.room_id)
          .consume(ws.id, consumerTransportId, producerId, rtpCapabilities)

        console.log(
          `---consuming--- name: ${
            roomList.get(ws.room_id) &&
            roomList.get(ws.room_id).getPeers().get(ws.id).name
          } prod_id:${producerId} consumer_id:${params.id}`
        )
        callback(params)
      }
    )

    ws.on("resume", async (data, callback) => {
      await consumer.resume()
      callback()
    })

    ws.on("getMyRoomInfo", (_, cb) => {
      cb(roomList.get(ws.room_id).toJson())
    })

    ws.on("disconnect", () => {
      console.log(
        `---disconnect--- name: ${
          roomList.get(ws.room_id) &&
          roomList.get(ws.room_id).getPeers().get(ws.id).name
        }`
      )
      if (!ws.room_id) return
      roomList.get(ws.room_id).removePeer(ws.id)
    })

    ws.on("producerClosed", ({ producer_id }) => {
      console.log(
        `---producer close--- name: ${
          roomList.get(ws.room_id) &&
          roomList.get(ws.room_id).getPeers().get(ws.id).name
        }`
      )
      roomList.get(ws.room_id).closeProducer(ws.id, producer_id)
    })

    ws.on("exitRoom", async (_, callback) => {
      console.log(
        `---exit room--- name: ${
          roomList.get(ws.room_id) &&
          roomList.get(ws.room_id).getPeers().get(ws.id).name
        }`
      )
      if (!roomList.has(ws.room_id)) {
        callback({
          error: "not currently in a room",
        })
        return
      }
      // close transports
      await roomList.get(ws.room_id).removePeer(ws.id)
      if (roomList.get(ws.room_id).getPeers().size === 0) {
        roomList.delete(ws.room_id)
      }

      ws.room_id = null

      callback("successfully exited room")
    })
  })
}

main()

function room() {
  return Object.values(roomList).map(r => {
    return {
      router: r.router.id,
      peers: Object.values(r.peers).map(p => {
        return {
          name: p.name,
        }
      }),
      id: r.id,
    }
  })
}
