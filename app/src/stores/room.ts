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
      joinRoom: async (user: User, room: Room, conn: WsConnection) => {
        if (!room.voiceId) {
          console.log("creating room " + room.id)
          const res = await conn.fetch("createRoom", {
            roomId: room.id,
          })
          console.log("created room " + room.id)

          if (typeof res === "object" && res && res.hasOwnProperty("roomId")) {
            room.voiceId = (res as { roomId: string }).roomId
          } else {
            if ((res as any).error !== "already exists") {
              throw new Error(
                "unable to join room as createRoom res is invalid " +
                  JSON.stringify(res)
              )
            } else {
              // this is only in debug when rooms are not loaded from server
              room.voiceId = room.id
            }
          }
        }

        console.log("joining room " + room.voiceId)
        await conn.fetch("joinRoom", {
          roomId: room.voiceId,
        })
        console.log("joined room " + room.voiceId)

        set(state => {
          const newRooms = [...state.rooms]
          for (let r of newRooms) {
            if (r.id === room.id) {
              r.voiceParticipants.push(user)
              break
            }
          }

          return { activeRoom: room, currentVoiceRoomId: room.voiceId ?? "" }
        })
      },
    })
  )
)
