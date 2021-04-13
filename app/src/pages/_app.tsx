import "../styles/globals.css"
import "../styles/vars.css"

import React from "react"
import Head from "next/head"
import NProgress from "nprogress"
import { AppProps } from "next/app"
import { IS_SERVER, PRODUCT_NAME } from "../constants/env"
import { Router } from "next/router"
import { WebSocketProvider } from '../components/WebSocketProvider'
Router.events.on("routeChangeStart", () => {
  NProgress.start()
})
Router.events.on("routeChangeComplete", () => NProgress.done())
Router.events.on("routeChangeError", () => NProgress.done())

function App({ Component, pageProps }: AppProps) {
  if (IS_SERVER) {
    return null
  }

  return (
    <WebSocketProvider
      shouldConnect={true}
    >
      <Head>
        <title>{PRODUCT_NAME}</title>
      </Head>
      <Component {...pageProps} />
    </WebSocketProvider>
  )
}

export default App
