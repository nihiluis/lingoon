import React from "react"
import { cx } from '../../lib/reexports'

interface Props {
  Src: (props: any) => JSX.Element
  reverse?: boolean
  size?: number
  onClick?: () => void
}

export default function Icon({ Src, reverse = false, size = 16, onClick }: Props) {
  const style = { stroke: "white", width: 16, height: 16 }
  const classes = cx({ "rounded-full bg-gray-800 table p-2 mr-2 w-1": reverse })
  const innerClasses = cx("")

  return (
    <div className={classes} onClick={onClick}>
      <Src style={style} className={innerClasses} />
    </div>
  )
}
