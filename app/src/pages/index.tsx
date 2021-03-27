import React, { useEffect, useState, useContext } from "react"

import Layout from "../components/ui/Layout"
import RoomSidebar from "../components/RoomSidebar"
import UserSidebar from "../components/UserSidebar"
import { cx } from "../lib/reexports"
import Chat from "../components/Chat"

interface Props {
  center: boolean
}

export default function Index() {
  return <IndexInner center />
}

function IndexInner(props: Props) {
  const { center } = props

  const classes = cx("max-w-screen-sm mt-8", { "mx-auto": center })

  return (
    <div className={classes}>
      <Layout
        showSidebarLeft={true}
        showSidebarRight={true}
        sidebarLeftComponent={<RoomSidebar />}
        sidebarRightComponent={<UserSidebar />}>
        <Chat />
      </Layout>
    </div>
  )
}

export async function getStaticProps() {
  return { props: {} }
}
