import React from "react"
import { cx } from "../../lib/reexports"

interface Props {
  amount: number
  bottom?: boolean
  top?: boolean
}

export default function MarginY({ amount, top = true, bottom = true }: Props) {
  return (
    <div className={cx({ [`mb-${amount}`]: bottom, [`mt-${amount}`]: top })} />
  )
}
