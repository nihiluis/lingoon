import React from "react"
import { User } from "../@types/user"
import { useUserStore } from "../stores/user"
import Avatar from "./ui/Avatar"
import ErrorText from "./ui/ErrorText"
import Line from "./ui/Line"
import Text from "./ui/Text"
import UserAvatar from "./UserAvatar"

interface Props {}

export default function UserSidebar(props: Props) {
  const { users } = useUserStore(state => state)

  return (
    <div className="ml-2 px-2">
      <Text text="Users" />
      <Line />
      {users.length === 0 && <ErrorText text="No users found." />}
      {users.map(user => (
        <UserItem key={`user-${user.id}`} user={user} />
      ))}
    </div>
  )
}

interface UserProps {
  user: User
}

function UserItem(props: UserProps) {
  const { user } = props

  const { activeUser, setActiveUser } = useUserStore(state => state)

  const isSelf = user.id === activeUser.id

  const displayName = isSelf ? `${user.name} (you)` : user.name

  return (
    <div className="flex mb-1" onClick={() => setActiveUser(user)}>
      <UserAvatar user={user} className="mr-2" />
      <p>{displayName}</p>
    </div>
  )
}
