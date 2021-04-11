import { Room } from "../@types/room"
import create from "zustand"
import { combine } from "zustand/middleware"
import { User } from "../@types/user"

export const useRoomStore = create(
  combine(
    {
      currentVoiceRoomId: "",
      activeRoom: {
        id: "chat",
        name: "Chat",
        isVoice: false,
        rtcParticipants: [],
      } as Room | null,
      rooms: [
        { id: "chat", name: "Chat", isVoice: false, rtcParticipants: [] },
        { id: "voice", name: "Voice", isVoice: true, rtcParticipants: [] },
      ] as Room[],
    },
    set => ({
      setVoiceRoomIdIfEmpty: (id: string) => set(state => ({currentVoiceRoomId: id || state.currentVoiceRoomId})),
      setActiveRoom: (room: Room) => set(state => ({ activeRoom: room })),
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
