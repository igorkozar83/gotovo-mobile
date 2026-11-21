// useSessionRestore.js
// Logs the user back in from the stored token (at app start, and to reload the user after a role switch).
// Only a session the server refuses (4xx) ends it; offline or on a server error the token stays.
import { getToken } from "../../Services/authToken"
import { handleError } from "../../Helpers"
import { accountClosedTitle, apiError } from "../../Helpers/apiErrors"
import { user as userApi } from "../../Services/API"
import useAuthStore from "../../stores/authStore"
import { useRefreshInboxCount } from "../queries/useInboxCount"
import useSession from "./useSession"
import { reportError } from "../../Helpers/reportError"
import { showNotice } from "../../stores/alerts"

/**
 * onTasker(): the restored user is a tasker (e.g. show the tasker introduction once)
 * Returns restore({ refreshCount }), which resolves to the restored user or null.
 */
const useSessionRestore = ({ onTasker } = {}) => {
  const setUser = useAuthStore((state) => state.setUser)
  const refreshInboxCount = useRefreshInboxCount()
  const { signOutLocally, showPendingTaskPrompts } = useSession()

  return async ({ refreshCount = false } = {}) => {
    const token = await getToken()
    if (!token) return null

    try {
      const user = await userApi()

      setUser({ loggedIn: true, userData: user })
      if (refreshCount) refreshInboxCount()
      if (user.type === "TASKER" && onTasker) onTasker()
      showPendingTaskPrompts(user)
      return user
    } catch (error) {
      reportError(error, "useSessionRestore")
      // no answer (offline) or a server error: keep the session for the next try
      if (!error.response || error.response.status >= 500) return null

      // a disabled account: already signed out with its notice (useSessionStart)
      if (apiError(error)?.code === "account_disabled") return null

      // the stored token is no longer taken (expired or revoked)
      if (apiError(error)?.code === "unauthenticated") {
        signOutLocally()
        showNotice("useSessionRestore.sessionEnded", "useSessionRestore.pleaseLogInAgain")
        return null
      }

      const failure = handleError(error)
      signOutLocally()
      showNotice(failure.type === 0 ? accountClosedTitle(apiError(error)) : "useSessionRestore.accountError", failure.message)
      return null
    }
  }
}

export default useSessionRestore
