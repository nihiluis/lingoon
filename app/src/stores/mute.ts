import create from "zustand"
import { combine } from "zustand/middleware"

export const useMuteStore = create(
  combine(
    {
      muted: true,
    },
    set => ({
      setMuted: (muted: boolean) => set(state => ({ muted })),
    })
  )
)
