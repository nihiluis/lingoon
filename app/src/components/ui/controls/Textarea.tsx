import React from "react"
import { cx } from "../../../lib/reexports"
import * as textareaStyle from "./Textarea.module.css"

interface Props {
  name: string
  value: string
  onChange?: (text: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}

export default function Textarea(props: Props): JSX.Element {
  const { value, name, onChange, onBlur, className, placeholder } = props

  return (
    <textarea
      name={name}
      className={cx(textareaStyle.input, className)}
      onChange={event => {
        if (onChange) onChange(event.target.value)
        event.preventDefault()
      }}
      placeholder={placeholder}
      onBlur={onBlur}
      value={value}
    />
  )
}
