// notificationHandlers.js
// What each kind of notification leads to, one handler per `type`. The handlers get what they may do
// through `app` (see useNotificationRouter), so this table has no React and no API of its own:
//   app.navigate(screen, params)       app.openModal(name, data)
//   app.alert(fields)                  app.closeAlert()
//   app.alertThenMyTasks(type, title, text, proceedText): an alert whose button goes to My Tasks
//   app.checkTaskModal(data, type)     app.openTimeAcceptedModal(timeId)
//   app.invalidateOffers() / invalidateReviews() / invalidateTaskerJobs()
//   app.isClient(): the logged-in user's role on the server is CLIENT
import { translate } from "../../Helpers/language.utils"

const notStartedText = (data) => translate("notificationHandlers.theClientDidNotConfirmThat", { name: data.task.taskName })

// the tasker goes on to review the client after the client confirmed the task complete
const reviewOfClient = (data) => ({
  taskId: data.taskId,
  userIdClient: data.userIdClient,
  type: "TASKER",
  alreadyRated: false,
  taskName: data.taskName,
  userId: data.userId,
  userName: data.userName,
  reviewed: data.reviewed
})

const toQA = (data, app) => app.navigate("Notifications", { qa: true })
const openCanceled = (data, app) => app.openModal("canceledTask", data)

export const NOTIFICATION_HANDLERS = {
  "tasker-start-task": (data, app) => app.checkTaskModal(data, "tasker-start-task"),

  // ("comfirm" is how the server spells these two types)
  "comfirm-start": (data, app) =>
    app.alertThenMyTasks(
      "success",
      "notificationHandlers.taskConfirmedAsStarted",
      translate("notificationHandlers.theClientConfirmedThatTheTask", { name: data.taskName }),
      "common.continue"
    ),

  "new-task-question": toQA,
  "answer-task-question": toQA,
  "mass-notif": (data, app) => app.navigate("Notifications", { notifications: true }),
  "new-task-offer": (data, app) => app.navigate("Notifications", { viewOffers: true }),

  "task-time-action": (data, app) => {
    const declined = data.status === 3
    app.alert({
      type: declined ? "error" : "success",
      title: translate(declined ? "notificationHandlers.dateproposedclientdescriptionerror" : "common.dateproposedclientdescription"),
      text: translate(declined ? "notificationHandlers.theProposedTimeForTaskHasBeenDeclined" : "notificationHandlers.theProposedTimeForTaskHasBeenAccepted", {
        name: data.taskName
      }),
      okText: translate("common.ok")
    })
  },

  // with a time already chosen the tasker is then told it was accepted; else they have to choose one. (OK closes this
  // alert first: one alert shows at a time, so the next one only queued behind it and OK seemed to do nothing)
  "accept-task-offer": (data, app) => {
    app.invalidateOffers()
    const next = data.postData
      ? () => {
          app.closeAlert()
          app.alert({
            type: "success",
            title: translate("notificationHandlers.taskTimeAccepted"),
            text: translate(data.postData.body),
            okText: translate("common.ok"),
            proceedAction: app.closeAlert
          })
        }
      : app.closeAlert
    app.alert({
      type: "success",
      title: translate(data.postData ? "notificationHandlers.taskOfferAccepted" : "notificationHandlers.taskOfferAcceptedChooseTime"),
      text: translate(data.postData ? "notificationHandlers.theClientAcceptedYourOfferForTask" : "notificationHandlers.theClientAcceptedYourOfferForTaskPlease", {
        name: data.taskName
      }),
      proceedText: translate("common.ok"),
      proceedAction: next
    })
  },

  "review-received": (data, app) => {
    app.invalidateReviews()
    app.invalidateTaskerJobs()
    app.openModal("reviewReceived", data)
  },

  "task-start-canceled": (data, app) => app.alertThenMyTasks("error", "notificationHandlers.taskStartNotConfirmed", notStartedText(data), "common.continue"),
  "task-not-started": (data, app) => app.alertThenMyTasks("success", "notificationHandlers.taskStartNotConfirmed", notStartedText(data), "common.ok"),
  "task-canceled": openCanceled,
  "cancel-task-offer": openCanceled,
  "cancel-task-tasker": (data, app) => app.openModal("canceledByTasker", data),

  "comfirm-complete": (data, app) => {
    const submitReview = reviewOfClient(data)
    app.alert({
      type: "success",
      title: translate("notificationHandlers.taskConfirmedComplete"),
      text: translate("notificationHandlers.theClientConfirmedTheCompletionOf", { name: data.taskName }),
      proceedText: translate("common.ok"),
      proceedAction: () => {
        app.navigate("MyTasks", { submitReview })
        app.closeAlert()
      }
    })
  },

  "edit-task-offer": (data, app) => app.checkTaskModal(data.task, "edit-task-offer"),
  "claim-complete": (data, app) => app.openModal("confirmComplete", data),

  // a client sees the task with its accepted time; a tasker only hears the time was accepted
  "task-time-accepted": (data, app) => {
    if (app.isClient()) return app.openTimeAcceptedModal(data.timeId)
    app.alert({
      type: "success",
      title: translate("notificationHandlers.taskTimeAccepted"),
      text: translate("notificationHandlers.theTimeForTaskHasBeen", { time: data.time, name: data.taskName }),
      okText: translate("common.ok")
    })
  },

  "new-task-time": (data, app) => app.openModal("newTime", data),
  "new-message-received": (data, app) =>
    app.openModal("newMessage", {
      type: data.userType,
      image: data.image,
      title: translate("notificationHandlers.newMessageFrom"),
      name: data.name,
      text: data.message,
      userId: data.userId,
      taskId: data.taskId
    }),
  "today-scheduled-task": (data, app) => app.openModal("scheduled", data),
  // the backend names the one who disputed it posted_by; the modal (and its SEND MESSAGE) reads postedBy
  "task-dispute": (data, app) => app.openModal("disputed", { taskId: data.taskId, taskName: data.taskName, reason: data.reason, postedBy: data.posted_by || data.postedBy }),

  "offer-revise-accepted": (data, app) =>
    app.alert({
      type: "success",
      title: translate("notificationHandlers.taskOfferRevisonAccepted"),
      text: translate("notificationHandlers.theOfferRevisionForTaskHas", { name: data.taskName }),
      okText: translate("common.ok")
    }),

  "offer-revise-refused": (data, app) =>
    app.alert({
      type: "success",
      title: translate("notificationHandlers.priceRevisionDeclined"),
      text: translate("notificationHandlers.clientDeclinedTheRevisedOfferFrom") + ".",
      proceedText: translate("common.ok"),
      proceedAction: () => {
        app.closeAlert()
        app.navigate("Notifications", { refresh: true })
      }
    })
}

// the live events that open a modal (their payload nests the data one level deeper than a push)
export const LIVE_MODAL_HANDLERS = {
  "tasker-start-task": (event, app) => app.checkTaskModal(event?.data?.data, "tasker-start-task"),
  "edit-task-offer": (event, app) => app.checkTaskModal(event?.data?.data?.task, "edit-task-offer"),
  "claim-complete": (event, app) => app.openModal("confirmComplete", event?.data?.data),
  "new-task-time": (event, app) => app.openModal("newTime", event?.data?.data)
}

// the role a notification is meant for (user_type 0 = client, 1 = tasker), if it says
export const roleOf = (data) => (data.user_type === 0 ? "CLIENT" : data.user_type === 1 ? "TASKER" : null)
