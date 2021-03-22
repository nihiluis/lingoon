import {
  DtlsParameters,
  DtlsState,
  MediaKind,
  Router,
  RtpCapabilities,
  RtpParameters,
  Worker,
} from "mediasoup/lib/types"
import config from "./config"
import Peer from "./peer"
import { RoomPeers, WorkerInfo } from "./types"

export default class Room {
  id: string
  worker: Worker
  router: Router
  peers: RoomPeers

  constructor(roomId: string, workerInfo: WorkerInfo) {
    this.id = roomId
    this.worker = workerInfo.worker
    this.router = workerInfo.router
    this.peers = {}
  }

  addPeer(peer: Peer) {
    this.peers[peer.id] = peer
  }

  getProducerList() {
    let producerList = []
    Object.values(this.peers).forEach(peer => {
      Object.values(peer._producers).forEach(producer => {
        producerList.push({
          producerId: producer.id,
        })
      })
    })
    return producerList
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities
  }

  async createWebRtcTransport(peer: Peer) {
    const {
      maxIncomingBitrate,
      initialAvailableOutgoingBitrate,
    } = config.mediasoup.webRtcTransport

    const transport = await this.router.createWebRtcTransport({
      listenIps: config.mediasoup.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    })

    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate)
      } catch (error) {}
    }

    transport.on("dtlsstatechange", (dtlsState: DtlsState) => {
      if (dtlsState === "closed") {
        console.log("---transport close--- " + peer.id + " closed")
        transport.close()
      }
    })

    transport.on("close", () => {
      console.log("---transport close--- " + peer.id + " closed")
    })

    console.log("---adding transport---", transport.id)
    peer.addTransport(transport)

    return {
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    }
  }

  async connectPeerTransport(
    peer: Peer,
    transportId: string,
    dtlsParameters: DtlsParameters
  ) {
    await peer.connectTransport(transportId, dtlsParameters)
  }

  async produce(
    peer: Peer,
    producerTransportId: string,
    rtpParameters: RtpParameters,
    kind: MediaKind
  ): Promise<string> {
    const producer = await peer.createProducer(
      producerTransportId,
      rtpParameters,
      kind
    )

    this.broadcast(peer, "newProducers", [
      {
        producerId: producer.id,
        producerPeerId: peer.id,
      },
    ])

    return producer.id
  }

  async consume(
    peer: Peer,
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ) {
    // handle nulls
    if (
      !this.router.canConsume({
        producerId,
        rtpCapabilities,
      })
    ) {
      console.error("can not consume")
      return
    }

    const { consumer, params } = await peer.createConsumer(
      consumerTransportId,
      producerId,
      rtpCapabilities
    )

    consumer.on("producerclose", () => {
      console.log(
        `---consumer closed--- due to producerclose event  id:${peer.id} consumer_id: ${consumer.id}`
      )
      peer.removeConsumer(consumer.id)
      // tell client consumer is dead

      peer.send("consumerClosed", { consumerId: consumer.id })
    })

    return params
  }

  async removePeer(peer: Peer) {
    this.peers[peer.id].close()

    delete this.peers[peer.id]
  }

  closeProducer(peer: Peer, producerId: string) {
    peer.closeProducer(producerId)
  }

  broadcast(fromPeer: Peer, type: string, data: any) {
    for (let peer of Object.values(this.peers)) {
      if (fromPeer.id !== peer.id) {
        peer.send(type, data)
      }
    }
  }

  getPeers() {
    return this.peers
  }

  json() {
    return {
      id: this.id,
      peers: JSON.stringify(this.peers),
    }
  }
}
