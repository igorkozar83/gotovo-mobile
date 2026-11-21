// useSessionStart.js
// At app start: the user is logged back in from the stored token (authStore.restoring until then), and
// every API answer that ends the session logs out with one notice: a disabled account, or a token the
// server no longer takes (expired or revoked). Returns reloadUser(refreshCount) for a reload later.
import { useEffect } from "react"

import useSession from "../auth/useSession"
import useSessionRestore from "../auth/useSessionRestore"
import useEvent from "../useEvent"
import useAuthStore from "../../stores/authStore"
import { setResponseErrorHandler } from "../../Services/client"
import { showTaskerIntroOnce } from "./taskerIntro"
import { showNotice } from "../../stores/alerts"
import { accountClosedTitle, apiError } from "../../Helpers/apiErrors"

const useSessionStart = () => {
  const { signOutLocally } = useSession()
  const restore = useSessionRestore({ onTasker: showTaskerIntroOnce })
  // the same function on every render (callers keep it in effects)
  const reloadUser = useEvent((refreshCount = false) => restore({ refreshCount }))
  const signOut = useEvent(() => signOutLocally())

  useEffect(() => {
    setResponseErrorHandler((error) => {
      // the caller still gets the failure (and shows nothing more: see useApiAction)
      const failure = apiError(error)
      if (failure && failure.code === "account_disabled") {
        signOut()
        showNotice(accountClosedTitle(failure), failure.message)
      } else if (failure && failure.code === "unauthenticated" && error.config?.headers?.Authorization && useAuthStore.getState().user.loggedIn) {
        // (once: signed out, the other requests still failing find no one signed in)
        signOut()
        showNotice("useSessionStart.sessionEnded", "useSessionStart.pleaseLogInAgain")
      }
      throw error
    })

    const { user, setRestoring } = useAuthStore.getState()
    if (user.loggedIn) setRestoring(false)
    else reloadUser().finally(() => setRestoring(false))

    return () => setResponseErrorHandler(null)
  }, [reloadUser, signOut])

  return reloadUser
}

export default useSessionStart
