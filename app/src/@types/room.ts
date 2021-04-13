import { User } from "./user"

export interface Room {
  id: string
  name: string
  voiceId?: string
  isVoice: boolean
  rtcParticipants: User[]
}
