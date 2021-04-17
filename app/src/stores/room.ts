import { Room } from "../@types/room"
import create from "zustand"
import { combine } from "zustand/middleware"
import { User } from "../@types/user"
import { WsConnection } from "../lib/ws"

function findExistingRoom(id: string, rooms: Room[]): Room | undefined {
  return rooms.find(r => r.id === id)
}

export const useRoomStore = create(
  combine(
    {
      currentVoiceRoomId: "",
      activeRoom: {
        id: "chat",
        name: "Chat",
        isVoice: false,
        voiceParticipants: [],
      } as Room | null,
      rooms: [
        { id: "chat", name: "Chat", isVoice: false, voiceParticipants: [] },
        {
          id: "voice",
          name: "Voice",
          voiceId: undefined,
          isVoice: true,
          voiceParticipants: [],
        },
      ] as Room[],
    },
    (set, get) => ({
      setVoiceRoomIdIfEmpty: (id: string) =>
        set(state => ({ currentVoiceRoomId: id || state.currentVoiceRoomId })),
      setActiveRoom: (room: Room) => set(state => ({ activeRoom: room })),
      addRoom: (room: Room) =>
        set(state => ({ rooms: [...state.rooms, room] })),
      removeRoom: (room: Room) =>
        set(state => {
          const newRooms = [...state.rooms].filter(r => r.id !== room.id)

          return { rooms: newRooms }
        }),
      joinRoom: async (user: User, room: Room, ws: WsConnection) => {
        const { rooms } = get()
        if (!room.voiceId) {
          const res = await ws.fetch("createRoom", {
            roomId: room.id,
          })

          if (typeof res === "object" && res && res.hasOwnProperty("roomId")) {
            room.voiceId = (res as { roomId: string }).roomId
          } else {
            return
          }
        }

        await ws.fetch("joinRoom", {
          roomId: room.voiceId,
        })

        set(state => {
          const newRooms = [...state.rooms]
          for (let r of newRooms) {
            if (r.id === room.id) {
              r.voiceParticipants.push(user)
              break
            }
          }

          return { activeRoom: room }
        })
      },
    })
  )
)
