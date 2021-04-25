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
import createTransport from "../lib/webrtc/createTransport"
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

        console.log("preparing device")

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
        console.log(`loaded device ${device.handlerName}`)

        set({
          device,
        })
      },
      loadTransports: async (conn: WsConnection) => {
        const { device } = get()

        if (!device) {
          return
        }

        const producerTransport = await createTransport(
          "producer",
          device,
          conn
        )
        const consumerTransport = await createTransport(
          "receiver",
          device,
          conn
        )

        set({
          recvTransport: consumerTransport,
          sendTransport: producerTransport,
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
