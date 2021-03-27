import React from "react"
import { User } from "../@types/user"
import Avatar from "./ui/Avatar"

interface Props {
  user: User
}

export default function UserAvatar({ user, ...rest }: Props & any) {
  return <Avatar name={user.name} {...rest} />
}
