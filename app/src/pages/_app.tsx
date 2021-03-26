import "../styles/globals.css"
import "../styles/vars.css"

import React from "react"
import Head from "next/head"
import { AppProps } from "next/app"
import { PRODUCT_NAME } from '../constants/env'

function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <title>{PRODUCT_NAME}</title>
      </Head>
      <Component {...pageProps} />
    </React.Fragment>
  )
}

export default App
