import React from "react"
import { cx } from '../../lib/reexports'

interface Props {
  Src: JSX.Element
  reverse?: boolean
  size?: number
}

export default function Icon({ Src, reverse = false, size = 24, ...rest }: Props & any) {
  const style = { width: size, height: size }
  const classes = cx("", { "": reverse })

  return (
    <Src style={style} className={classes} />
  )
}
