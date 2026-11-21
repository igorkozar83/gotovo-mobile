import { act } from "@testing-library/react-native"

import { NOTIFICATION_HANDLERS, LIVE_MODAL_HANDLERS, roleOf } from "../main/notificationHandlers"
import { showAlert, closeAlert } from "../../stores/alerts"
import useModalStore from "../../stores/modalStore"

const fakeApp = (overrides = {}) => ({
  navigate: jest.fn(),
  openModal: jest.fn(),
  alert: jest.fn(),
  closeAlert: jest.fn(),
  alertThenMyTasks: jest.fn(),
  checkTaskModal: jest.fn(),
  openTimeAcceptedModal: jest.fn(),
  invalidateOffers: jest.fn(),
  invalidateReviews: jest.fn(),
  invalidateTaskerJobs: jest.fn(),
  isClient: () => false,
  ...overrides
})

const handle = (type, data, app = fakeApp()) => {
  NOTIFICATION_HANDLERS[type](data, app)
  return app
}

describe("notification handlers", () => {
  it("covers every type the server sends", () => {
    expect(Object.keys(NOTIFICATION_HANDLERS).sort()).toEqual(
      [
        "accept-task-offer",
        "answer-task-question",
        "cancel-task-offer",
        "cancel-task-tasker",
        "claim-complete",
        "comfirm-complete",
        "comfirm-start",
        "edit-task-offer",
        "mass-notif",
        "new-message-received",
        "new-task-offer",
        "new-task-question",
        "new-task-time",
        "offer-revise-accepted",
        "offer-revise-refused",
        "review-received",
        "task-canceled",
        "task-dispute",
        "task-not-started",
        "task-start-canceled",
        "task-time-accepted",
        "task-time-action",
        "tasker-start-task",
        "today-scheduled-task"
      ].sort()
    )
  })

  it("sends questions and answers to the Q&A tab", () => {
    expect(handle("new-task-question", {}).navigate).toHaveBeenCalledWith("Notifications", { qa: true })
    expect(handle("answer-task-question", {}).navigate).toHaveBeenCalledWith("Notifications", { qa: true })
  })

  it("opens the matching modal with the notification's data", () => {
    const data = { taskId: 5 }
    expect(handle("claim-complete", data).openModal).toHaveBeenCalledWith("confirmComplete", data)
    expect(handle("task-canceled", data).openModal).toHaveBeenCalledWith("canceledTask", data)
    expect(handle("cancel-task-offer", data).openModal).toHaveBeenCalledWith("canceledTask", data)
    expect(handle("cancel-task-tasker", data).openModal).toHaveBeenCalledWith("canceledByTasker", data)
    expect(handle("today-scheduled-task", data).openModal).toHaveBeenCalledWith("scheduled", data)
  })

  it("a dispute opens with the one who disputed it as the modal reads them (posted_by -> postedBy)", () => {
    // the payload of OpenDispute (backend); without postedBy the modal hid them and SEND MESSAGE crashed
    const data = { type: "task-dispute", taskId: 9, taskName: "Fix the tap", reason: "Not finished", posted_by: { id: 6, name: "Ana", avatar: null } }
    expect(handle("task-dispute", data).openModal).toHaveBeenCalledWith("disputed", {
      taskId: 9,
      taskName: "Fix the tap",
      reason: "Not finished",
      postedBy: { id: 6, name: "Ana", avatar: null }
    })
  })

  it("reloads reviews and the tasker's jobs when a review arrives", () => {
    const app = handle("review-received", { taskId: 1 })
    expect(app.invalidateReviews).toHaveBeenCalled()
    expect(app.invalidateTaskerJobs).toHaveBeenCalled()
    expect(app.openModal).toHaveBeenCalledWith("reviewReceived", { taskId: 1 })
  })

  it("an accepted offer without a time asks the tasker to choose one", () => {
    const app = handle("accept-task-offer", { taskName: "Paint" })
    expect(app.invalidateOffers).toHaveBeenCalled()
    const fields = app.alert.mock.calls[0][0]
    expect(fields.text).toContain("Paint")
    expect(fields.text).toContain("accept or propose a time")
    expect(fields.proceedAction).toBe(app.closeAlert)
  })

  it("an accepted offer with a time then says the time was accepted", () => {
    const app = handle("accept-task-offer", { taskName: "Paint", postData: { body: "Monday 10h" } })
    app.alert.mock.calls[0][0].proceedAction()
    expect(app.alert.mock.calls[1][0]).toMatchObject({ title: "Task time accepted", text: "Monday 10h" })
  })

  it("with the real alerts: OK on the accepted offer closes it and shows the accepted time (it stayed, the next one queued)", () => {
    const app = fakeApp({ alert: showAlert, closeAlert })
    handle("accept-task-offer", { taskName: "Paint", postData: { body: "Monday 10h" } }, app)
    act(() => useModalStore.getState().mainAlert.proceedAction())
    expect(useModalStore.getState().mainAlert).toMatchObject({ open: true, title: "Task time accepted", text: "Monday 10h" })
    act(() => useModalStore.getState().mainAlert.proceedAction())
    expect(useModalStore.getState().mainAlert.open).toBe(false)
  })

  it("an accepted time opens the task for a client and only tells a tasker", () => {
    const client = handle("task-time-accepted", { timeId: 9 }, fakeApp({ isClient: () => true }))
    expect(client.openTimeAcceptedModal).toHaveBeenCalledWith(9)
    expect(client.alert).not.toHaveBeenCalled()

    const tasker = handle("task-time-accepted", { timeId: 9, taskName: "Paint", time: "10:00" })
    expect(tasker.openTimeAcceptedModal).not.toHaveBeenCalled()
    expect(tasker.alert.mock.calls[0][0].text).toContain("Paint")
  })

  it("a declined time is an error, an accepted one a success", () => {
    expect(handle("task-time-action", { status: 3, taskName: "X" }).alert.mock.calls[0][0].type).toBe("error")
    expect(handle("task-time-action", { status: 1, taskName: "X" }).alert.mock.calls[0][0].type).toBe("success")
  })

  it("a confirmed complete task takes the tasker on to review the client", () => {
    const app = handle("comfirm-complete", { taskId: 3, taskName: "Paint", userIdClient: 1, userId: 6, userName: "Ana", reviewed: false })
    app.alert.mock.calls[0][0].proceedAction()
    expect(app.navigate).toHaveBeenCalledWith("MyTasks", {
      submitReview: { taskId: 3, userIdClient: 1, type: "TASKER", alreadyRated: false, taskName: "Paint", userId: 6, userName: "Ana", reviewed: false }
    })
    expect(app.closeAlert).toHaveBeenCalled()
  })

  it("a revised offer checks the task first", () => {
    const task = { task: { id: 4 }, editedOffer: { id: 2 } }
    expect(handle("edit-task-offer", { task }).checkTaskModal).toHaveBeenCalledWith(task, "edit-task-offer")
  })

  it("the live events read the data one level deeper", () => {
    const app = fakeApp()
    LIVE_MODAL_HANDLERS["claim-complete"]({ type: "claim-complete", data: { data: { taskId: 1 } } }, app)
    expect(app.openModal).toHaveBeenCalledWith("confirmComplete", { taskId: 1 })
    LIVE_MODAL_HANDLERS["new-task-time"]({ type: "new-task-time", data: { data: { taskId: 2 } } }, app)
    expect(app.openModal).toHaveBeenCalledWith("newTime", { taskId: 2 })
  })

  it("reads the role a notification is meant for", () => {
    expect(roleOf({ user_type: 0 })).toBe("CLIENT")
    expect(roleOf({ user_type: 1 })).toBe("TASKER")
    expect(roleOf({})).toBeNull()
  })
})
