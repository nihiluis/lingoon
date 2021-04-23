import {
  Device,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  Transport,
  TransportOptions,
} from "mediasoup-client/lib/types"
import { WsConnection } from "../ws"

type TransportSide = "producer" | "receiver"

export default async function createTransport(
  side: TransportSide,
  device: Device,
  conn: WsConnection
): Promise<Transport> {
  const transportData = await conn.fetch("createWebRtcTransport", {})

  const tmpTransportData = transportData as {
    id: string
    iceParameters: IceParameters
    iceCandidates: IceCandidate[]
    dtlsParameters: DtlsParameters
  }

  let transport: Transport
  if (side === "producer") {
    transport = device.createSendTransport(tmpTransportData)
  } else {
    transport = device.createRecvTransport(tmpTransportData)
  }

  transport.on(
    "connect",
    async (
      { dtlsParameters }: { dtlsParameters: DtlsParameters },
      callback: () => void,
      errback: (err: Error) => void
    ) => {
      conn
        .fetch("connectTransport", {
          dtlsParameters,
          transportId: tmpTransportData.id,
        })
        .then(callback)
        .catch(errback)
    }
  )
  transport.on("connectionstatechange", function (state) {
    switch (state) {
      case "connecting":
        break

      case "connected":
        //localVideo.srcObject = stream
        break

      case "failed":
        transport.close()
        break

      default:
        break
    }
  })
  if (side === "producer") {
    transport.on(
      "produce",
      async function ({ kind, rtpParameters }, callback, errback) {
        try {
          const res = await conn.fetch("produce", {
            producerTransportId: transport.id,
            kind,
            rtpParameters,
          })

          if (
            !res ||
            typeof res !== "object" ||
            !res!.hasOwnProperty("producerId")
          ) {
            errback(new Error("invalid producerId returned"))
            return
          }

          const producerId = (res as Partial<{ producerId: string }>)[
            "producerId"
          ] as string
          callback({
            id: producerId,
          })
        } catch (err) {
          errback(err)
        }
      }
    )
  }
  return transport
}
