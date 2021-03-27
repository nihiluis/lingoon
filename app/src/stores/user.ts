import { Room } from "../@types/room"
import create from "zustand"
import { combine } from "zustand/middleware"
import { User } from "../@types/user"

export const useUserStore = create(
  combine(
    {
      activeUser: {
        id: "roberto",
        name: "Roberto",
      },
      users: [
        { id: "tomaso", name: "Tomaso" },
        { id: "roberto", name: "Roberto" },
      ] as User[],
    },
    set => ({
      setActiveUser: (user: User) => set(state => ({ activeUser: user })),
    })
  )
)
