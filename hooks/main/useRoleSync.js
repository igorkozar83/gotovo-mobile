// useRoleSync.js
// The role the app is used in follows the user's role from the server; a change of role in the app (the
// side menu, or a notification meant for the other role) is saved on the server, then the old role's data
// goes and the user reloads. (Where the app goes is the chooser's: the menu goes Home, a notification to
// what it is about.)
import { useEffect, useRef } from "react"

import useApiAction from "../useApiAction"
import useEvent from "../useEvent"
import useResetRoleData from "../queries/useResetRoleData"
import useAuthStore from "../../stores/authStore"
import { updateUserType } from "../../Services/UsersAPI"

// reloadUser(refreshCount): reloads the logged-in user
const useRoleSync = (reloadUser) => {
  const userData = useAuthStore((state) => state.user.userData)
  const userSelect = useAuthStore((state) => state.userSelect)
  const setUserSelect = useAuthStore((state) => state.setUserSelect)
  const resetRoleData = useResetRoleData()

  const saveUserType = useApiAction(updateUserType, {
    spinner: false,
    error: "useRoleSync.userTypeChangeError",
    failedTitle: "useRoleSync.userTypeCouldNotBeChanged",
    onSuccess: () => {
      resetRoleData()
      reloadUser(true)
    }
  })

  // the server's role wins, when it changes (not when the user picks the other one: that is saved below)
  const serverType = userData && userData.type
  const followServer = useEvent((type) => {
    if ((type === "CLIENT" || type === "TASKER") && type !== userSelect) setUserSelect(type)
  })
  useEffect(() => {
    followServer(serverType)
  }, [serverType, followServer])

  // a role chosen in the app is saved (only when the choice changes: not the role it starts with, and not
  // on every reload of the user)
  const lastChoice = useRef(userSelect)
  const saveChosenRole = useEvent(() => {
    if (lastChoice.current === userSelect) return
    lastChoice.current = userSelect
    if (!userData || !userData.id) return
    const chosen = userSelect === "TASKER" ? "TASKER" : "CLIENT"
    if (chosen === userData.type) return
    saveUserType.run(chosen === "TASKER" ? 1 : 0)
  })
  useEffect(() => {
    saveChosenRole()
  }, [userSelect, saveChosenRole])
}

export default useRoleSync
