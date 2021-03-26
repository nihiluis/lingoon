import { Room } from "../@types/voice"
import create from "zustand"
import { combine } from "zustand/middleware"
import { User } from "../@types/user"

export const useRoomStore = create(
  combine(
    {
      activeRoom: null as Room | null,
      rooms: [
        { id: "test1", name: "Test", isVoice: true, rtcParticipants: [] },
      ] as Room[],
    },
    set => ({
      addRoom: (room: Room) =>
        set(state => ({ rooms: [...state.rooms, room] })),
      removeRoom: (room: Room) =>
        set(state => {
          const newRooms = [...state.rooms].filter(r => r.id !== room.id)

          return { rooms: newRooms }
        }),
      joinRoom: (user: User, room: Room) =>
        set(state => {
          const newRooms = [...state.rooms]
          for (let r of newRooms) {
            if (r.id === room.id) {
              r.rtcParticipants.push(user)
            }
          }

          return { activeRoom: room }
        }),
    })
  )
)
