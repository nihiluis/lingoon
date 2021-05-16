import React, { useEffect, useRef, useState } from "react"
import { useConsumerStore } from "../../stores/consumer"
interface AudioRenderProps {}

const MyAudio = ({
  volume,
  onRef,
  ...props
}: React.DetailedHTMLProps<
  React.AudioHTMLAttributes<HTMLAudioElement>,
  HTMLAudioElement
> & {
  onRef: (a: HTMLAudioElement) => void
  volume: number
}) => {
  const myRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume
    }
  }, [volume])
  return (
    <audio
      ref={r => {
        if (r && !myRef.current) {
          ;(myRef as any).current = r
          onRef(r)
        }
      }}
      {...props}
    />
  )
}

export const AudioRender: React.FC<AudioRenderProps> = () => {
  const { consumerMap, setAudioRef } = useConsumerStore()
  const audioRefs = useRef<[string, HTMLAudioElement][]>([])

  return (
    <>
      <div className={`absolute top-0 w-full h-full flex bg-primary-900`}>
        <div className={`flex p-8 rounded m-auto bg-primary-700 flex-col`}>
          {Object.keys(consumerMap).map(k => {
            const { consumer, volume: userVolume } = consumerMap[k]
            return (
              <MyAudio
                volume={0.5}
                // autoPlay
                playsInline
                controls={false}
                key={consumer.id}
                onRef={a => {
                  setAudioRef(k, a)
                  audioRefs.current.push([k, a])
                  a.srcObject = new MediaStream([consumer.track])
                  a.play().catch(error => {
                    console.warn("audioElem.play() failed:%o", error)
                  })
                }}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
