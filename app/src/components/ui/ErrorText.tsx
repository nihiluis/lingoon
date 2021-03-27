import React, { PropsWithChildren } from "react"

export default function ErrorText({
  text,
  touched,
}: {
  text?: string
  touched?: boolean
}): JSX.Element | null {
  if (!text || !touched) {
    return null
  }

  return <p className="error">{text}</p>
}
