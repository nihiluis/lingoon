import { detectDevice, Device, Transport } from "mediasoup-client/lib/types"
import create from "zustand"
import { combine } from "zustand/middleware"

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
      roomId: "",
      micStream: null as MediaStream | null,
      mic: null as MediaStreamTrack | null,
      recvTransport: null as Transport | null,
      sendTransport: null as Transport | null,
      device: null as Device | null,
    },
    set => ({
      prepare: async () => {
        let d = await getDevice()
        set({
          device: d,
        })
      },
      nullify: () =>
        set({
          recvTransport: null,
          sendTransport: null,
          roomId: "",
          mic: null,
          micStream: null,
        }),
      set,
    })
  )
)
