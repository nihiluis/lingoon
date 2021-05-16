import { useProducerStore } from "../../stores/producer"
import { useVoiceStore } from "../../stores/voice"
import { WsConnection } from "../ws"
import { consumeAudio } from "./consumeAudio"

export const receiveVoice = async (
  conn: WsConnection,
  flushQueue: () => void
) => {
  // benawad/dogehouse/blob/32345024f1076fd57ccf0d7066eef05cc9721a03/shawarma/src/index.ts
  // send request to ws for consumer track (see RoomClient.js) for each (producer) peer that is not himself
  conn.once<any>("recv-tracks_cb", ({ consumerParametersArr }) => {
    console.log("handling recv-tracks_cb")
    try {
      for (const { peerId, consumerParameters } of consumerParametersArr) {
        consumeAudio(consumerParameters, peerId)
      }
    } catch (err) {
      console.log(err)
    } finally {
      flushQueue()
    }
  })

  conn.send("recv-tracks", {
    rtpCapabilities: useVoiceStore.getState().device!.rtpCapabilities,
  })
}
