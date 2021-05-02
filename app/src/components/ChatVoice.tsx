import React, { useContext, useEffect, useMemo, useRef } from "react"
import { useRoomStore } from "../stores/room"
import { useUserStore } from "../stores/user"
import Icon from "./icon"
import Textarea from "./ui/controls/Textarea"
import Text from "./ui/Text"
import UserAvatar from "./UserAvatar"
import MicOnSvg from "./icon/Mic.svg"
import MicOffSvg from "./icon/MicOff.svg"
import { useMuteStore } from "../stores/mute"
import { useVoiceStore } from "../stores/voice"
import { WebSocketContext } from "./WebSocketProvider"
import { MicPicker } from "./MicPicker"
import { useMicIdStore } from "../stores/micId"
import { sendVoice } from "../lib/webrtc/sendVoice"
import { AudioRender } from "./webrtc/AudioRender"
import { consumeAudio } from "../lib/webrtc/consumeAudio"
import { receiveVoice } from "../lib/webrtc/receiveVoice"

interface Props {}

export default function ChatVoice(props: Props) {
  const messages = []
  const { conn } = useContext(WebSocketContext)
  if (!conn) {
    return null
  }
  const { currentVoiceRoomId, activeRoom, joinRoom } = useRoomStore(
    state => state
  )
  const user = useUserStore(state => state.activeUser)
  const { device, loadDevice } = useVoiceStore(state => state)
  const { micId } = useMicIdStore(state => state)
  const { muted, setMuted } = useMuteStore(state => state)
  const consumerQueue = useRef<{ roomId: string; d: any }[]>([])
  const initialLoad = useRef(true)

  useEffect(() => {
    if (micId && !initialLoad.current) {
      sendVoice()
    }
    initialLoad.current = false
  }, [micId])

  if (!activeRoom || !activeRoom.isVoice) {
    return null
  }

  useMemo(() => {
    async function use() {
      if (!conn) {
        return
      }

      if (activeRoom && activeRoom.id !== currentVoiceRoomId) {
        await joinRoom(user, activeRoom, conn)
        await loadDevice(activeRoom, conn)
      }
    }
    use()
  }, [activeRoom, currentVoiceRoomId, conn])

  async function flushConsumerQueue(_roomId: string) {
    try {
      for (const {
        roomId,
        d: { peerId, consumerParameters },
      } of consumerQueue.current) {
        if (_roomId === roomId) {
          await consumeAudio(consumerParameters, peerId)
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      consumerQueue.current = []
    }
  }
  conn.addListener<any>("joined", async data => {
    const { loadTransports } = useVoiceStore.getState()

    await loadTransports(conn)
    await sendVoice()

    receiveVoice(conn, () => flushConsumerQueue(data.roomId))
  })

  return (
    <div className="relative min-h-full">
      <div className="absolute bottom-0 right-0 left-0 mb-2 h-24">
        <div className="rounded-lg bg-gray-400 flex p-2">
          <Icon
            Src={muted ? MicOffSvg : MicOnSvg}
            reverse
            onClick={() => setMuted(!muted)}
          />
          <MicPicker />
          <AudioRender />
        </div>
      </div>
    </div>
  )
}
