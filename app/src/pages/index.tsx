import React, { useEffect, useState, useContext } from "react"

import Layout from "../components/Layout"

export default function Index() {
  return (
    <IndexInner />
  )
}

function IndexInner() {
  // grab all fields for specified focusedType
  // render these fields in sidebar
  //

  return (
    <Layout
      showSidebarLeft={true}
      showSidebarRight={true}
      sidebarLeftComponent={<React.Fragment></React.Fragment>}
      sidebarRightComponent={<React.Fragment></React.Fragment>}>
      {null}
    </Layout>
  )
}

export async function getStaticProps() {
  return { props: {} }
}
