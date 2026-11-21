// useTaskerCancel.js
// A tasker canceling a task they took, with a reason. After the cancel the offers are shown again and
// the tasker is told it worked.
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"

import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { cancelTaskTasker } from "../../Services/TasksAPI"
import { failedRules } from "../../Helpers/validation"

// the tasker's accepted offer on the task
export const acceptedOfferOf = (task) => (task && Array.isArray(task.offers) ? task.offers.filter((offer) => offer.status === 1).pop() : undefined) || { user: {} }

const useTaskerCancel = (task, close) => {
  const navigation = useNavigation()
  const { showError, showSuccess } = useAlert()
  const [reason, setReason] = useState("")

  const cancel = useApiAction(cancelTaskTasker, {
    error: "useTaskerCancel.cancelTaskErrorError",
    invalid: {},
    failedTitle: "useTaskerCancel.cancelTaskError",
    failed: "useTaskerCancel.thereWasAnErrorWhileCanceling",
    invalidate: [["myTasks"], ["inbox", "offers"]],
    onSuccess: () => {
      setReason("")
      navigation.navigate("Notifications", { refreshOffers: true })
      showSuccess("useTaskerCancel.taskcanceltaskertitle", "useTaskerCancel.taskHasBeenCanceledSuccessfully")
    }
  })

  const submit = () => {
    const offer = acceptedOfferOf(task)
    const problems = failedRules([
      [!offer.id, "useTaskerCancel.offerIdIsNotSet"],
      [!reason, "useTaskerCancel.pleaseEnterExplanation"]
    ])
    if (problems) return showError("useTaskerCancel.cancelTaskError", problems)
    close()
    cancel.run(offer.id, reason)
  }

  return { reason, setReason, submit }
}

export default useTaskerCancel
