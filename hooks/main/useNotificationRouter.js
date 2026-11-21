// useNotificationRouter.js
// Routes a tapped push notification, or a live event asking for a modal, to what it leads to (the table
// in notificationHandlers): an alert, a modal (stores/modalStore) or a screen. This hook gives the
// handlers what they may do, including the two cases that first load the task.
import { useNavigation } from "@react-navigation/native"
import { useQueryClient } from "@tanstack/react-query"

import { NOTIFICATION_HANDLERS, LIVE_MODAL_HANDLERS, roleOf } from "./notificationHandlers"
import { translate } from "../../Helpers/language.utils"
import { reportError } from "../../Helpers/reportError"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import useModalStore from "../../stores/modalStore"
import { useInvalidateOffers } from "../queries/useInbox"
import { useInvalidateTaskerJobs } from "../queries/useTaskerJobs"
import { useInvalidateReviews } from "../queries/useReviews"
import { getTaskById, getTaskInfoByTimeId } from "../../Services/TasksAPI"
import { showAlert, closeAlert } from "../../stores/alerts"

const useNotificationRouter = () => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const setUserSelect = useAuthStore((state) => state.setUserSelect)
  const { openModal } = useModalStore.getState()
  const invalidateOffers = useInvalidateOffers()
  const invalidateTaskerJobs = useInvalidateTaskerJobs()
  const invalidateReviews = useInvalidateReviews()

  const alert = showAlert

  // a started task asks the client to confirm only while it is still waiting (status 8); a revised offer
  // shows whether the client already answered it (even when the task could not be loaded)
  const checkTaskModal = async (data, type) => {
    const taskId = type === "edit-task-offer" ? data.task.id : data.taskId
    const hideSpinner = useUiStore.getState().showSpinner()
    try {
      const task = await queryClient.fetchQuery({ queryKey: ["task", taskId], queryFn: () => getTaskById(taskId) })
      if (type === "tasker-start-task") {
        if (task.status === 8) openModal("startedTask", data)
      } else if (type === "edit-task-offer") {
        const answered = task.offers.some((offer) => offer.id === data.editedOffer.id && offer.status !== 0)
        openModal("offerSent", { ...data, taskOfferStatusEdited: answered })
      }
    } catch (e) {
      reportError(e, "useNotificationRouter.checkTaskModal")
      if (type === "edit-task-offer") openModal("offerSent", { ...data, taskOfferStatusEdited: false })
    } finally {
      hideSpinner()
    }
  }

  // the client sees the task with its accepted time
  const openTimeAcceptedModal = async (timeId) => {
    try {
      const info = await getTaskInfoByTimeId(timeId)
      const time = info.task.times.filter((tm) => tm.status === 1).pop() || null
      openModal("timeAccepted", { data: info, confirmedDate: time })
    } catch (e) {
      reportError(e, "useNotificationRouter.timeAccepted")
    }
  }

  const app = {
    navigate: (screen, params) => navigation.navigate(screen, params),
    openModal,
    alert,
    closeAlert,
    alertThenMyTasks: (type, title, text, proceedText) =>
      alert({
        type,
        title: translate(title),
        text,
        proceedText: translate(proceedText),
        proceedAction: () => {
          closeAlert()
          navigation.navigate("MyTasks", { refresh: true })
        }
      }),
    checkTaskModal,
    openTimeAcceptedModal,
    invalidateOffers,
    invalidateReviews,
    invalidateTaskerJobs,
    isClient: () => useAuthStore.getState().user?.userData?.type === "CLIENT"
  }

  const routeNotification = (data) => {
    if (!data) return
    // the notification is for the user in one role: switch to it
    const role = roleOf(data)
    if (role) setUserSelect(role)
    const handle = NOTIFICATION_HANDLERS[data.type]
    if (handle) handle(data, app)
  }

  const routeLiveModal = (event) => {
    const handle = event && LIVE_MODAL_HANDLERS[event.type]
    if (handle) handle(event, app)
  }

  return { routeNotification, routeLiveModal }
}

export default useNotificationRouter
