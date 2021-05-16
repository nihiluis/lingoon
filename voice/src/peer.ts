import {
  Consumer,
  Producer,
  Transport,
  DtlsParameters,
  RtpParameters,
  MediaKind,
  RtpCapabilities,
} from "mediasoup/lib/types"
import WebSocket from "ws"
import sendData from "./messages/sendData"

export default class Peer {
  id: string
  _socket: WebSocket

  _transports: Record<string, Transport> = {}
  recvTransportId: string = ""
  sendTransportId: string = ""
  consumers: Record<string, Consumer> = {}
  _producers: Record<string, Producer> = {}
  producer: Producer | undefined

  constructor(peerId: string, socket: WebSocket) {
    this.id = peerId
    this._socket = socket
  }

  addTransport(transport: Transport, side: "recv" | "send") {
    this._transports[transport.id] = transport

    if (side === "recv") {
      console.log("setting recv transport for peer " + this.id)
      this.recvTransportId = transport.id
    } else {
      console.log("setting send transport for peer " + this.id)
      this.sendTransportId = transport.id
    }
  }

  async connectTransport(
    transportId: string,
    side: "recv" | "send",
    dtlsParameters: DtlsParameters
  ) {
    if (!this._transports.hasOwnProperty(transportId)) return

    await this._transports[transportId].connect({
      dtlsParameters: dtlsParameters,
    })
  }

  async createProducer(
    producerTransportId: string,
    rtpParameters: RtpParameters,
    kind: MediaKind
  ) {
    //TODO handle null errors
    const producer = await this._transports[producerTransportId].produce({
      kind,
      rtpParameters,
    })

    this._producers[producer.id] = producer
    this.producer = producer

    producer.on("transportclose", () => {
      console.log(
        `---producer transport close--- id: ${this.id} consumer_id: ${producer.id}`
      )
      producer.close()

      delete this._producers[producer.id]
      this.producer = undefined
    })

    return producer
  }

  async createConsumer(
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ) {
    const consumerTransport = this._transports[consumerTransportId]

    let consumer: Consumer
    try {
      consumer = await consumerTransport.consume({
        producerId: producerId,
        rtpCapabilities,
        paused: false, //producer.kind === 'video',
      })
    } catch (error) {
      console.error("consume failed", error)
      return
    }

    if (consumer.type === "simulcast") {
      await consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2,
      })
    }

    this.consumers[consumer.id] = consumer

    consumer.on("transportclose", () => {
      console.log(
        `---consumer transport close--- id: ${this.id} consumer_id: ${consumer.id}`
      )

      delete this.consumers[consumer.id]
    })

    console.log(
      `peer.createConsumer params: ${JSON.stringify({
        producerId: producerId,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      })}`
    )

    return {
      consumer,
      params: {
        producerId: producerId,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      },
    }
  }

  send(type: string, data: any) {
    sendData(this._socket, type, data)
  }

  closeProducer(producerId: string) {
    try {
      this._producers[producerId].close()
    } catch (e) {
      console.warn(e)
    }

    delete this._producers[producerId]
    this.producer = undefined
  }

  getProducer(producerId: string) {
    return this._producers[producerId]
  }

  close() {
    Object.values(this._transports).forEach(transport => transport.close())
  }

  removeConsumer(consumerId: string) {
    delete this.consumers[consumerId]
  }
}
