import * as React from "react"
import { cx } from "../../lib/reexports"

import * as style from "./Avatar.module.css"

interface Props {
  size?: number
  url?: string
  className?: string
  name?: string
}

const Avatar: React.FunctionComponent<Props> = ({
  size = 24,
  url,
  name,
  className,
}) => {
  const classes = url
    ? cx(style.avatar, className)
    : cx(style.miniAvatar, className)

  return url ? (
    <div className={classes}>
      <img
        src={url}
        className={style.avatarImage}
        style={{ width: size, height: size }}
      />
    </div>
  ) : (
    <div className={classes} style={{ width: size, height: size }}>
      <p>{name ? name[0] : "-"}</p>
    </div>
  )
}

export default Avatar
