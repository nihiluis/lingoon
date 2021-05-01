import { useMicIdStore } from "../../stores/micId"
import { useMicPermErrorStore } from "../../stores/micPermError"
import { useProducerStore } from "../../stores/producer"
import { useVoiceStore } from "../../stores/voice"

export const sendVoice = async () => {
  const { micId } = useMicIdStore.getState()
  const { close } = useProducerStore.getState()
  const { sendTransport, set, mic } = useVoiceStore.getState()
  if (!sendTransport) {
    console.log("no sendTransport in sendVoice")
    return
  }
  mic?.stop()
  // eslint-disable-next-line init-declarations
  let micStream: MediaStream
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: micId ? { deviceId: micId } : true,
    })
    useMicPermErrorStore.getState().set({ error: false })
  } catch (err) {
    set({ mic: null, micStream: null })
    console.log(err)
    useMicPermErrorStore.getState().set({ error: true })
    return
  }

  const audioTracks = micStream.getAudioTracks()

  if (audioTracks.length) {
    console.log("creating producer...")
    const track = audioTracks[0]

    const producer = await sendTransport.produce({
      track,
      appData: { mediaTag: "cam-audio" },
    })

    /*
    producer.on("trackended", () => {
      close()
    })

    producer.on("transportclose", () => {
      console.log("producer transport close")
      close()
    })

    producer.on("close", () => {
      console.log("closing producer")
      close()
    })
    */

    useProducerStore.getState().add(producer)
    set({ mic: track, micStream })
    return
  }

  set({ mic: null, micStream: null })
}
