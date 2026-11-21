// useResetRoleData.js
// The server answers the inbox lists and the calendar for the user's current role (client or tasker).
// After a role switch this drops what was loaded for the old role, so it is never shown for the new
// one, and reloads what is on screen.
import { useQueryClient } from "@tanstack/react-query"

import { myTasksKeys } from "./useMyTasks"

const useResetRoleData = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.resetQueries({ queryKey: ["inbox"] })
    queryClient.resetQueries({ queryKey: myTasksKeys.calendar })
  }
}

export default useResetRoleData
