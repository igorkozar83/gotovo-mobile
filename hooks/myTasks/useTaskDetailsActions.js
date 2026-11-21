// useTaskDetailsActions.js
// Actions of the active task details screen (client and tasker).
import { useNavigation } from "@react-navigation/native"

import { useOpenTaskDetails } from "../queries/useDetails"
import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { getAcceptedOffer, getEditedOffer, getPendingRevision } from "../../Helpers/taskStatus"
import { cancelTask, newTaskDateTasker } from "../../Services/TasksAPI"
import useRevisionActions from "../offers/useRevisionActions"
import { askToConfirm, showSuccessThen } from "../../stores/alerts"

const useTaskDetailsActions = (task) => {
  const navigation = useNavigation()
  const openDetails = useOpenTaskDetails()
  const { showError, showSuccess } = useAlert()

  // back to the (refreshed) current tasks list
  const backToList = () => navigation.navigate("MyTasks", { refresh: true })

  const viewOffers = () => navigation.navigate("Notifications", { viewOffers: true, taskDetailsId: task.id })

  const goToMessageUser = () => navigation.navigate("Chat", { userId: task.accepted_by_user.id, taskId: task.id })

  const openTaskDetails = (originalTimes) => openDetails(task, originalTimes ? { originalTimes: true } : undefined)

  const newDate = useApiAction(newTaskDateTasker, {
    error: "useTaskDetailsActions.taskOfferNewDateError",
    failed: "useTaskDetailsActions.taskDateCouldNotBeAdded",
    onSuccess: () => showSuccess("useTaskDetailsActions.taskOfferNewDateSuccess", "common.dateproposedclientdescription")
  })

  // date = [start, end]; the tasker passes their own offer id (it may be disputed)
  const proposeNewTaskDate = (date, offerId = getAcceptedOffer(task).id) => {
    if (!offerId) return showError("useTaskDetailsActions.taskOfferNewDateError", "useTaskDetailsActions.taskOfferIdIsNotSet")
    if (!date || date.length !== 2) return showError("useTaskDetailsActions.taskOfferNewDateError", "useTaskDetailsActions.pleaseChooseDates")
    newDate.run(offerId, date)
  }

  const cancel = useApiAction(cancelTask, {
    error: "useTaskDetailsActions.taskCancelError",
    failed: "common.taskCouldNotBeCanceledPlease",
    invalidate: [["myTasks"]],
    onSuccess: () => {
      backToList()
      showSuccess("useTaskDetailsActions.cancelTask", "useTaskDetailsActions.taskHasBeenCanceledSuccessfully")
    }
  })

  const doCancelTask = () => {
    askToConfirm({ title: "useTaskDetailsActions.taskCancelation", text: "useTaskDetailsActions.areYouSureThatYouWant", showClose: true, onConfirm: () => cancel.run(task.id) })
  }

  const revision = useRevisionActions({
    acceptedAlert: false,
    onDeclined: backToList,
    onAccepted: () =>
      showSuccessThen("useTaskDetailsActions.taskRevisionAcceptSuccess", "useTaskDetailsActions.taskRevisionAcceptedSuccessfully", () =>
        navigation.navigate("Notifications", { refreshOffers: true })
      )
  })

  const doAcceptRevision = () => revision.acceptRevision(getEditedOffer(task).id)

  const doDeclineRevision = () => {
    const pending = getPendingRevision(task)
    if (pending) revision.declineRevision(pending.id)
  }

  return {
    backToList,
    viewOffers,
    goToMessageUser,
    openTaskDetails,
    proposeNewTaskDate,
    doCancelTask,
    doAcceptRevision,
    doDeclineRevision
  }
}

export default useTaskDetailsActions
