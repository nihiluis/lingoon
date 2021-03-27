import { User } from "./user"

export interface Room {
  id: string
  name: string
  isVoice: boolean
  rtcParticipants: User[]
}
