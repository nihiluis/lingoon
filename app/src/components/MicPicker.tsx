import React, { useEffect, useState } from "react"
import { useMicIdStore } from "../stores/micId"

interface MicPickerProps {}

export const MicPicker: React.FC<MicPickerProps> = () => {
  const { micId, setMicId } = useMicIdStore(state => state)
  const [options, setOptions] = useState<
    Array<{ id: string; label: string } | null>
  >([])
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(x =>
        setOptions(
          x
            .map((y, idx) =>
              y.kind !== "audioinput"
                ? null
                : { id: y.deviceId, label: y.label || `Audio ${idx}` }
            )
            .filter(x => !!x)
        )
      )
  }, [])

  useEffect(() => {
    const defaultOption = options[0]?.id
    if (defaultOption) {
      setMicId(defaultOption)
    }
  }, [options])

  return (
    <>
      {options.length === 0 ? (
        <div className="flex">no mics available</div>
      ) : null}
      {options.length ? (
        <select
          value={micId}
          onChange={e => {
            const id = e.target.value
            setMicId(id)
          }}>
          {options.map(x =>
            !x ? null : (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            )
          )}
        </select>
      ) : null}
    </>
  )
}
