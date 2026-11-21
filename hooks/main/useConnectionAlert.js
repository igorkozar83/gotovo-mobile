// useConnectionAlert.js
// Tells the user when the device is offline; that alert (only it) closes when the connection is back.
import { useEffect, useRef } from "react"
import NetInfo from "@react-native-community/netinfo"

import { hideAlert, showBlocking } from "../../stores/alerts"

const useConnectionAlert = () => {
  const shown = useRef(null)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        if (shown.current == null) shown.current = showBlocking("useConnectionAlert.connectionProblem", "useConnectionAlert.pleaseCheckYourInternetConnectionOr")
      } else if (shown.current != null) {
        hideAlert(shown.current)
        shown.current = null
      }
    })
    return () => unsubscribe()
  }, [])
}

export default useConnectionAlert
