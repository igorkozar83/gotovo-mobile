// useApiAction.js
// One server action (a POST): the global spinner while it runs, success/error alerts, and refreshing the queries
// whose data it changed. The call succeeds when it resolves (API v2) and fails with the API's error
// ({ error: { code, message, fields } }, see Helpers/apiError) or without an answer (network, a 5xx page).
import { useMutation, useQueryClient } from "@tanstack/react-query"

import useEvent from "./useEvent"
import useUiStore from "../stores/uiStore"
import useAlert from "./useAlert"
import { validationMessage, apiError } from "../Helpers/apiErrors"
import { reportError } from "../Helpers/reportError"

/**
 * action: (...args) => Promise<data>  the API call
 * options:
 *   success: { title, text } of the success alert; none when omitted
 *   error: title of the alert for a refusal (its text is the server's message); none when omitted
 *   failed: text of the error alert when the request itself fails (network, 5xx)
 *   invalid: for an invalid form (code "invalid"): { messageKey, field } to list its fields (see
 *            Helpers/apiErrors), or a function (error) => text | { title, text } | null to format it (e.g.
 *            serverMessages); when it gives nothing, `failed` shows
 *   failedTitle: title of the alerts for a failed request or an invalid form (defaults to `error`)
 *   invalidate: query keys to refresh after a success, e.g. [["myTasks"], ["inboxCount"]]
 *   onSuccess(data, ...args), onError(error, ...args): extra work after the alerts; error is what the call
 *            threw: read the API's code and message with apiError(error) (Helpers/apiError; an axios error has a
 *            `code` of its own). Not called for a disabled account: the session ends
 *   spinner: false to not show the global spinner
 * Returns { run(...args), isRunning }. run resolves to the answer's data (nothing for 204), or null when the
 * request failed or was refused.
 */
const useApiAction = (action, { success, error, failed = "Please try again later.", invalid, failedTitle, invalidate = [], onSuccess, onError, spinner = true } = {}) => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useAlert()

  const mutation = useMutation({ mutationFn: (args) => action(...args) })

  // the same function on every render (effects can depend on it); it runs with the latest options
  const run = useEvent(async (...args) => {
    const hideSpinner = spinner ? useUiStore.getState().showSpinner() : null
    try {
      const data = await mutation.mutateAsync(args)
      if (success) showSuccess(success.title, success.text)
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
      if (onSuccess) onSuccess(data, ...args)
      return data
    } catch (e) {
      reportError(e, "useApiAction")
      const failure = apiError(e)
      // a disabled account: the session ended, with its own notice (useSessionStart); nothing more to do
      if (failure && failure.code === "account_disabled") return null
      // a refusal (anything but an invalid form) shows the server's message
      if (failure && failure.code !== "invalid") {
        if (error) showError(error, failure.message)
        if (onError) onError(e, ...args)
        return null
      }
      const formatted = typeof invalid === "function" ? invalid(e) : invalid ? validationMessage(e, invalid) : null
      const title = failedTitle || error
      if (formatted && typeof formatted === "object") showError(formatted.title || title, formatted.text || failed)
      else if (formatted) showError(title, formatted)
      else if (title) showError(title, failed)
      if (onError) onError(e, ...args)
      return null
    } finally {
      if (hideSpinner) hideSpinner()
    }
  })

  return { run, isRunning: mutation.isPending }
}

export default useApiAction
