// useTaskOfferActions.js
// What the offer details screen (TaskOffer) can do with the offer and its task, besides accepting it
// (useAcceptOffer).
import { useNavigation } from "@react-navigation/native"

import useAuthStore from "../../stores/authStore"
import { useOfferCache } from "../queries/useDetails"
import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { acceptTaskDate, cancelOffer, cancelTask, completeTask, newTaskDateTasker, startTask } from "../../Services/TasksAPI"
import useRevisionActions from "../offers/useRevisionActions"
import { apiError } from "../../Helpers/apiErrors"
import { askToConfirm } from "../../stores/alerts"

const MY_TASKS = ["myTasks"]
const OFFERS = ["inbox", "offers"]
const OFFER_CANCELED = 4

/**
 * offerId: the offer shown; acceptedDate: the task's accepted time (then no other can be accepted); selectedDate: the time picked
 * onOfferCanceled(): the server answered a tasker's offer cancel (the offer counts as canceled then)
 */
const useTaskOfferActions = ({ offerId, acceptedDate, selectedDate, onOfferCanceled }) => {
  const navigation = useNavigation()
  const offerCache = useOfferCache(offerId)
  const { showError, showSuccess } = useAlert()

  // read when an action runs, so it is the offer as it is then
  const offer = () => offerCache.get()
  const task = () => offer().task
  const backToMyTasks = () => navigation.navigate("MyTasks", { refresh: true })

  const complete = useApiAction(completeTask, {
    success: { title: "useTaskOfferActions.taskClaimedComplete", text: "useTaskOfferActions.clientMustConfirmThatTaskIs" },
    error: "common.taskCompleteError",
    failed: "useTaskOfferActions.taskCouldNotBeCompletedPlease",
    invalidate: [MY_TASKS, OFFERS],
    onSuccess: () => navigation.navigate("Notifications", { refreshOffers: true })
  })
  const doCompleteTask = () => complete.run(task().id)

  const cancelTaskAction = useApiAction(cancelTask, {
    success: { title: "useTaskOfferActions.taskCanceled", text: "useTaskOfferActions.taskCanceledSuccessfully" },
    error: "useTaskOfferActions.taskCancelError",
    failed: "common.taskCouldNotBeCanceledPlease",
    invalidate: [MY_TASKS, OFFERS]
  })

  // the offer counts as canceled on the screen once the server answered, even with an error. Withdrawn, the shown
  // offer is the tasker's canceled one at once (its status and "offer cancelled" notice); refused, it reloads, as
  // the server knows why
  const cancelOfferAction = useApiAction(cancelOffer, {
    success: { title: "useTaskOfferActions.taskOfferCancel", text: "useTaskOfferActions.taskOfferSuccessfullyCanceled" },
    error: "useTaskOfferActions.taskOfferCancelError",
    failed: "useTaskOfferActions.thereWasAnErrorWhileCanceling",
    invalid: {},
    invalidate: [MY_TASKS, OFFERS],
    onSuccess: () => {
      offerCache.update((current) => ({ ...current, status: OFFER_CANCELED, canceled_by: "tasker" }))
      onOfferCanceled()
    },
    onError: (error) => {
      const refusal = apiError(error)
      if (refusal && refusal.code !== "invalid") {
        offerCache.reload()
        onOfferCanceled()
      }
    }
  })

  // the client cancels the task, the tasker their offer
  const doCancelOffer = () => {
    const isClient = useAuthStore.getState().userSelect === "CLIENT"

    askToConfirm({
      title: isClient ? "useTaskOfferActions.taskCancelation" : "useTaskOfferActions.offerCancelation",
      text: isClient ? "useTaskOfferActions.areYouSureThatYouWantToCancelTask" : "useTaskOfferActions.areYouSureThatYouWantToCancelOffer",
      showClose: true,
      onConfirm: () => (isClient ? cancelTaskAction.run(task().id) : cancelOfferAction.run(offer().id))
    })
  }

  const acceptDate = useApiAction(acceptTaskDate, {
    success: { title: "useTaskOfferActions.taskTimeAcceptSuccess", text: "useTaskOfferActions.taskDateSuccessfullyAccepted" },
    error: "common.taskTimeAcceptError",
    failed: "useTaskOfferActions.taskTimeCouldNotBeAccepted",
    invalidate: [MY_TASKS],
    onSuccess: (resp, dateId) => {
      offerCache.update((current) => ({
        ...current,
        task: { ...current.task, times: current.task.times.map((time) => (time.id === dateId ? { ...time, status: 1 } : time)) }
      }))
    }
  })

  const doAcceptDate = () => {
    if (acceptedDate) return showError("common.taskTimeAcceptError", "useTaskOfferActions.timeAlreadyAcceptedForThisTask")
    if (!selectedDate) return showError("common.taskTimeAcceptError", "useTaskOfferActions.pleaseChooseTime")
    acceptDate.run(selectedDate.id)
  }

  const newDate = useApiAction(newTaskDateTasker, {
    error: "useTaskOfferActions.taskOfferNewDateError",
    failed: "useTaskOfferActions.taskDateCouldNotBeAdded",
    onSuccess: () => showSuccess("useTaskOfferActions.taskOfferNewDateSuccess", "common.dateproposedclientdescription")
  })

  // date = [start, end]
  const proposeNewTaskDate = (date) => {
    if (!offer().id) return showError("useTaskOfferActions.taskOfferNewDateError", "useTaskOfferActions.taskOfferIdIsNotSet")
    if (!date || date.length !== 2) return showError("useTaskOfferActions.taskOfferNewDateError", "useTaskOfferActions.pleaseChooseDates")
    newDate.run(offer().id, date)
  }

  const start = useApiAction(startTask, {
    error: "common.startTaskError",
    failed: "useTaskOfferActions.thereWasAnErrorWhileStarting",
    invalidate: [MY_TASKS],
    onSuccess: backToMyTasks
  })
  const doStartTask = (type) => start.run(type, offer().id)

  const revision = useRevisionActions({ onAccepted: backToMyTasks, onDeclined: backToMyTasks })
  const doAcceptRevision = () => revision.acceptRevision(offer().id)

  // declines the latest revision (edited offer) of the task
  const refuseRevise = () => {
    const edited = task()
      .offers.filter((o) => o.edit_id)
      .pop()
    revision.declineRevision(edited.id)
  }

  const goToMessageUser = () => {
    const current = task()
    const userId = current.posted_by_user.id === useAuthStore.getState().user.userData.id ? current.accepted_by_user.id : current.posted_by_user.id
    navigation.navigate("Chat", { userId, taskId: current.id })
  }

  return {
    doCompleteTask,
    doCancelOffer,
    doAcceptDate,
    proposeNewTaskDate,
    doStartTask,
    doAcceptRevision,
    refuseRevise,
    goToMessageUser
  }
}

export default useTaskOfferActions
