import React from "react"
import cx from "classnames"

interface Props {
  height?: number
  className?: string
  dark?: boolean
}

export default function Line({
  height = 1,
  className = "",
  dark = false,
}: Props): JSX.Element {
  return (
    <div
      className={cx({ "bg-gray-300": !dark, "bg-gray-400": dark }, className)}
      style={{ height }}></div>
  )
}
