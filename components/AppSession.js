// AppSession.js
// What runs for the whole app once it is up: the language, logging back in (and the disabled-account
// guard), keeping the role in step with the server, and the welcome on the very first start (after the
// splash and the intro video).
import React, { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import WelcomeModal from "./modals/WelcomeModal"
import useLanguageSetup from "../hooks/main/useLanguageSetup"
import useSessionStart from "../hooks/main/useSessionStart"
import useRoleSync from "../hooks/main/useRoleSync"

const FIRST_LOAD_KEY = "firstLoadCheck"

const AppSession = ({ hideSplash, statusPlaying }) => {
  useLanguageSetup()
  const reloadUser = useSessionStart()
  useRoleSync(reloadUser)

  const [welcome, setWelcome] = useState(false)
  useEffect(() => {
    if (!hideSplash || statusPlaying) return
    AsyncStorage.getItem(FIRST_LOAD_KEY)
      .then((seen) => !seen && setWelcome(true))
      .catch(() => {})
  }, [hideSplash, statusPlaying])

  return (
    <WelcomeModal
      visible={welcome}
      onVisibleChange={setWelcome}
      onDone={() => {
        AsyncStorage.setItem(FIRST_LOAD_KEY, "true").catch(() => {})
        setWelcome(false)
      }}
    />
  )
}

export default AppSession
