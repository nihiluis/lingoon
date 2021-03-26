import { Room } from "../@types/voice"
import create from "zustand"
import { combine } from "zustand/middleware"
import { User } from "../@types/user"

export const useUserStore = create(
  combine(
    {
      users: [
        { id: "test1", name: "Tomaso" },
        { id: "test2", name: "Roberto" },
      ] as User[],
    },
    set => ({})
  )
)
