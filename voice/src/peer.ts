import {
  Consumer,
  Producer,
  Transport,
  DtlsParameters,
  RtpParameters,
  MediaKind,
  RtpCapabilities,
} from "mediasoup/lib/types"

export default class Peer {
  id: string
  name: string

  transports: Map<string, Transport>
  consumers: Map<string, Consumer>
  producers: Map<string, Producer>

  constructor(socketId: string, name: string) {
    this.id = socketId
    this.name = name
    this.transports = new Map()
    this.consumers = new Map()
    this.producers = new Map()
  }

  addTransport(transport: Transport) {
    this.transports.set(transport.id, transport)
  }

  async connectTransport(transportId: string, dtlsParameters: DtlsParameters) {
    if (!this.transports.has(transportId)) return
    await this.transports.get(transportId).connect({
      dtlsParameters: dtlsParameters,
    })
  }

  async createProducer(
    producerTransportId: string,
    rtpParameters: RtpParameters,
    kind: MediaKind
  ) {
    //TODO handle null errors
    const producer = await this.transports.get(producerTransportId).produce({
      kind,
      rtpParameters,
    })

    this.producers.set(producer.id, producer)

    producer.on(
      "transportclose",
      function () {
        console.log(
          `---producer transport close--- name: ${this.name} consumer_id: ${producer.id}`
        )
        producer.close()
        this.producers.delete(producer.id)
      }.bind(this)
    )

    return producer
  }

  async createConsumer(
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ) {
    let consumerTransport = this.transports.get(consumerTransportId)

    let consumer = null
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

    this.consumers.set(consumer.id, consumer)

    consumer.on(
      "transportclose",
      function () {
        console.log(
          `---consumer transport close--- name: ${this.name} consumer_id: ${consumer.id}`
        )
        this.consumers.delete(consumer.id)
      }.bind(this)
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

  closeProducer(producerId: string) {
    try {
      this.producers.get(producerId).close()
    } catch (e) {
      console.warn(e)
    }

    this.producers.delete(producerId)
  }

  getProducer(producerId: string) {
    return this.producers.get(producerId)
  }

  close() {
    this.transports.forEach(transport => transport.close())
  }

  removeConsumer(consumerId: string) {
    this.consumers.delete(consumerId)
  }
}
