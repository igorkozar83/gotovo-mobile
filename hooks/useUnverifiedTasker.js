// useUnverifiedTasker.js
// A tasker whose account isn't verified yet can't use the inbox and their tasks: `locked` says so, and
// explain(onDone) tells them, with an OK that opens the licences in their profile.
import { useNavigation } from "@react-navigation/native"

import useAuthStore from "../stores/authStore"
import { explainUnverifiedTasker } from "../stores/alerts"

const useUnverifiedTasker = () => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const locked = userSelect === "TASKER" && !user.userData?.verifications?.verified_tasker

  const explain = (onDone) => {
    if (!locked || !user.loggedIn) return
    explainUnverifiedTasker(() => {
      navigation.navigate("Profile", { navigationLicences: true })
      if (onDone) onDone()
    })
  }

  return { locked, explain }
}

export default useUnverifiedTasker
