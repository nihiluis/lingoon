import { ConsumerOptions } from "mediasoup-client/lib/types"
import { useConsumerStore } from "../../stores/consumer"
import { useVoiceStore } from "../../stores/voice"

export const consumeAudio = async (consumerParameters: any, peerId: string) => {
  const { recvTransport } = useVoiceStore.getState()
  if (!recvTransport) {
    console.log("skipping consumeAudio because recvTransport is null")
    return false
  }

  console.log(
    `sending consume for peer ${peerId} with params ${JSON.stringify(
      consumerParameters
    )}`
  )

  const consumer = await recvTransport.consume({
    ...consumerParameters,
    appData: {
      peerId,
      producerId: consumerParameters.producerId,
      mediaTag: "cam-audio",
    },
  })

  console.log(`consuming peerId ${peerId}`)

  useConsumerStore.getState().add(consumer, peerId)

  return true
}
