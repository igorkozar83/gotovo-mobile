// usePushRegistration.js
// Registers the device for push notifications once (after the intro video) and gives the user's Expo
// push token to the backend while they are logged in, again when the system replaces it.
import { useEffect, useRef, useState } from "react"

import useAuthStore from "../../stores/authStore"
import useApiAction from "../useApiAction"
import { registerForPushNotifications, onPushTokenChange } from "../../Services/pushNotifications"
import { updateExpoPushToken } from "../../Services/UsersAPI"
import { reportError } from "../../Helpers/reportError"

const usePushRegistration = () => {
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const [pushToken, setPushToken] = useState(null)
  const registered = useRef(false)
  const { run: saveToken } = useApiAction(updateExpoPushToken, { spinner: false })

  useEffect(() => {
    if (loggedIn && pushToken) saveToken(pushToken)
  }, [loggedIn, pushToken, saveToken])

  // a token the system replaced (the backend gets the new one through the effect above)
  useEffect(() => onPushTokenChange(setPushToken), [])

  // safe to call more than once: the device registers (and asks for the permission) only the first time
  const register = () => {
    if (registered.current) return
    registered.current = true
    registerForPushNotifications()
      .then((token) => token && setPushToken(token))
      .catch((e) => reportError(e, "usePushRegistration"))
  }

  return { register }
}

export default usePushRegistration
