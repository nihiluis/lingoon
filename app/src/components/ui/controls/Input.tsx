import React from "react"
import { cx } from "../../../lib/reexports"
import * as inputStyle from "./Input.module.css"

interface Props {
  type: string
  name: string
  value: string
  onChange?: (text: string) => void
  onBlur?: () => void
  className?: string
}

export default function Input(props: Props): JSX.Element {
  const { value, type, name, onChange, onBlur, className } = props

  return (
    <input
      type={type}
      name={name}
      className={cx(inputStyle.input, className)}
      onChange={event => {
        if (onChange) onChange(event.target.value)
        event.preventDefault()
      }}
      onBlur={onBlur}
      value={value}
    />
  )
}
