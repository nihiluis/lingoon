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
import createTransport from "../lib/webrtc/createTransport"
import protect from "await-protect"

interface Props {}

export default function ChatVoice(props: Props) {
  const messages = []
  const { conn } = useContext(WebSocketContext)
  const { currentVoiceRoomId, activeRoom, joinRoom } = useRoomStore(
    state => state
  )
  const user = useUserStore(state => state.activeUser)
  const { device, loadDevice, set: voiceSet } = useVoiceStore(state => state)
  const { micId } = useMicIdStore(state => state)
  const { muted, setMuted } = useMuteStore(state => state)
  const consumerQueue = useRef<{ roomId: string; d: any }[]>([])
  const initialLoad = useRef(true)

  if (!conn) {
    console.log("conn is null")
    return null
  }

  useEffect(() => {
    if (micId) {
      //if (micId && !initialLoad.current) {
      sendVoice()
    }
    initialLoad.current = false
  }, [micId])

  if (!activeRoom || !activeRoom.isVoice) {
    console.log("active room is not valid")
    return null
  }

  useMemo(() => {
    async function use() {
      if (!conn) {
        return
      }

      if (activeRoom && activeRoom.id !== currentVoiceRoomId) {
        if (!device) {
          return
        }

        const [_, joinRoomErr] = await protect(joinRoom(user, activeRoom, conn))
        if (joinRoomErr) {
          console.log(joinRoomErr.message)
          return
        }
        console.log("joined room")
        const loadedDevice = await loadDevice(activeRoom, conn)

        if (!loadedDevice) {
          console.log("unable to load device")
          return
        }

        const consumerTransport = await createTransport(
          "receiver",
          loadedDevice,
          conn
        )
        const producerTransport = await createTransport(
          "producer",
          loadedDevice,
          conn
        )

        voiceSet({
          recvTransport: consumerTransport,
          sendTransport: producerTransport,
        })
      }
    }
    use()
  }, [activeRoom, device, currentVoiceRoomId, conn])

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
  conn.addListener<any>("you-joined", async data => {
    // produce ws handler is called in createTransport, join should occur and could be tested?
    console.log("handling you-joined")

    // consumerQueue should be empty, will never be filled I think
    receiveVoice(conn, () => flushConsumerQueue(data.roomId))
  })

  conn.addListener<any>("speaker-joined", async data => {
    console.log("handling speaker joined")
  })

  return (
    <div className="relative min-h-full">
      <AudioRender />
      <div className="absolute bottom-0 right-0 left-0 mb-2 h-24">
        <div className="rounded-lg bg-gray-400 flex p-2">
          <Icon
            Src={muted ? MicOffSvg : MicOnSvg}
            reverse
            onClick={() => setMuted(!muted)}
          />
          <MicPicker />
        </div>
      </div>
    </div>
  )
}
