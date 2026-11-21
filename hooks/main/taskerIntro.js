// taskerIntro.js
// The tasker introduction (SwitchToTaskerModal: what it takes to become a tasker) is shown once, the first
// time the user turns to the tasker side, and never to someone who is a tasker already (verified, or with
// tasks done as one: a new installation does not make them new to it).
import AsyncStorage from "@react-native-async-storage/async-storage"

import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import { reportError } from "../../Helpers/reportError"

const SEEN_KEY = "taskerClick"

const isTaskerAlready = () => {
  const { user } = useAuthStore.getState()
  const data = user.loggedIn ? user.userData : null
  return Boolean(data && (data.verifications?.verified_tasker || data.tasks_count_tasker > 0))
}

export const showTaskerIntroOnce = async () => {
  try {
    if (await AsyncStorage.getItem(SEEN_KEY)) return
    if (!isTaskerAlready()) useModalStore.getState().openModal("taskerIntro")
    await AsyncStorage.setItem(SEEN_KEY, "true")
  } catch (e) {
    reportError(e, "taskerIntro")
  }
}
