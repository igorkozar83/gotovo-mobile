// useLoadTask.js
// Loads a task or a task offer by id on demand, e.g. before opening its screen from a modal or a
// notification. Shows the global spinner while loading and an error alert when it could not be loaded.
import { useQueryClient } from "@tanstack/react-query"

import useUiStore from "../../stores/uiStore"
import useAlert from "../useAlert"
import { getTaskById, getTaskOffer } from "../../Services/TasksAPI"
import { apiError } from "../../Helpers/apiErrors"
import { reportError } from "../../Helpers/reportError"

// queryKey(id), fetch(id) -> the item
const useLoadOnDemand = ({ queryKey, fetch, errorTitle, failed }) => {
  const queryClient = useQueryClient()
  const { showError } = useAlert()

  return async (id) => {
    const hideSpinner = useUiStore.getState().showSpinner()
    try {
      // always fresh (staleTime 0); concurrent loads of the same item share one request
      return await queryClient.fetchQuery({ queryKey: queryKey(id), queryFn: () => fetch(id) })
    } catch (e) {
      reportError(e, "useLoadTask")
      // the server's reason (e.g. "This task no longer exists."), or `failed` when the request failed
      const failure = apiError(e)
      showError(errorTitle, failure ? failure.message : failed)
    } finally {
      hideSpinner()
    }
    return null
  }
}

/**
 * options: errorTitle, failed (text when the request itself fails)
 * Returns load(taskId), which resolves to the task or null.
 */
const useLoadTask = ({ errorTitle = "Task info retrieve error", failed = "There was an error while receiving task info. Please try again later." } = {}) =>
  useLoadOnDemand({ queryKey: (id) => ["task", id], fetch: getTaskById, errorTitle, failed })

/** Returns load(taskOfferId), which resolves to the task offer or null. */
export const useLoadTaskOffer = ({ errorTitle = "Task offer info retrieve error", failed = "We couldnt get task offer info" } = {}) =>
  useLoadOnDemand({ queryKey: (id) => ["taskOffer", id], fetch: getTaskOffer, errorTitle, failed })

export default useLoadTask
