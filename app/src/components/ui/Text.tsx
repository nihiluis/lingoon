import React, { PropsWithChildren } from "react"
import { cx } from "../../lib/reexports"

type TextSize = "normal" | "large"

interface Props {
  text?: string
  size?: TextSize
  className?: string
}

export default function Text({
  text,
  size = "normal",
  className,
}: Props): JSX.Element | null {
  if (!text) {
    return null
  }

  const classes = cx(className, { "text-lg": size === "large" })

  return <p className={classes}>{text}</p>
}
