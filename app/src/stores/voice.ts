import {
  detectDevice,
  Device,
  Transport,
  RtpCapabilities,
  TransportOptions,
  DtlsParameters,
  IceParameters,
  IceCandidate,
} from "mediasoup-client/lib/types"
import create from "zustand"
import { combine } from "zustand/middleware"
import { Room } from "../@types/room"
import { WsConnection } from "../lib/ws"

export const getDevice = async () => {
  try {
    let handlerName = detectDevice()
    if (!handlerName) {
      handlerName = "Chrome74"
    }
    return new Device({ handlerName })
  } catch {
    return null
  }
}

export const useVoiceStore = create(
  combine(
    {
      micStream: null as MediaStream | null,
      mic: null as MediaStreamTrack | null,
      recvTransport: null as Transport | null,
      sendTransport: null as Transport | null,
      device: null as Device | null,
    },
    (set, get) => ({
      prepareDevice: async () => {
        const device = await getDevice()
        if (!device) {
          set({ device: null })
          return
        }

        set({ device })
      },
      loadDevice: async (room: Room, conn: WsConnection) => {
        const device = get().device
        if (!device) {
          return
        }

        const rtpCapabilities = await conn.fetch("getRouterRtpCapabilities", {
          roomId: room.voiceId,
        })

        if (
          typeof rtpCapabilities === "object" &&
          rtpCapabilities &&
          !rtpCapabilities.hasOwnProperty("error")
        ) {
          return
        }

        await device.load({
          routerRtpCapabilities: rtpCapabilities as RtpCapabilities,
        })

        set({
          device,
        })
      },
      loadTransports: async (conn: WsConnection) => {
        const { device } = get()

        if (!device) {
          return
        }

        const transportData = await conn.fetch("createWebRtcTransport", {})

        const tmpTransportData = transportData as {
          id: string
          iceParameters: IceParameters
          iceCandidates: IceCandidate[]
          dtlsParameters: DtlsParameters
        }

        const producerTransport = device.createSendTransport(
          transportData as TransportOptions
        )
        producerTransport.on(
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
        producerTransport.on(
          "produce",
          async function ({ kind, rtpParameters }, callback, errback) {
            try {
              const res = await conn.fetch("produce", {
                producerTransportId: producerTransport.id,
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

        producerTransport.on("connectionstatechange", function (state) {
          switch (state) {
            case "connecting":
              break

            case "connected":
              //localVideo.srcObject = stream
              break

            case "failed":
              producerTransport.close()
              break

            default:
              break
          }
        })
      },
      nullify: () =>
        set({
          recvTransport: null,
          sendTransport: null,
          mic: null,
          micStream: null,
        }),
      set,
    })
  )
)
