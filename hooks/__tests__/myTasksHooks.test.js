import { act } from "@testing-library/react-native"

import useMyTasksRoute from "../myTasks/useMyTasksRoute"
import useTaskDetailsActions from "../myTasks/useTaskDetailsActions"
import useTaskerTaskActions from "../myTasks/useTaskerTaskActions"
import useConfirmComplete, { otherParty } from "../myTasks/useConfirmComplete"
import useNewTimeAnswer from "../myTasks/useNewTimeAnswer"
import useStartedTaskAnswer from "../myTasks/useStartedTaskAnswer"
import useTaskerCancel, { acceptedOfferOf } from "../myTasks/useTaskerCancel"
import useProposedTimePrompt from "../myTasks/useProposedTimePrompt"
import useStartedTaskPrompt from "../myTasks/useStartedTaskPrompt"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import { renderHookWithQuery } from "../../testUtils/render"
import * as TasksAPI from "../../Services/TasksAPI"
import { subscribe } from "../../Services/live"
import { hideAlert } from "../../stores/alerts"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/live", () => ({ subscribe: jest.fn(() => () => {}) }))
jest.mock("../../Services/TasksAPI", () => ({
  cancelTask: jest.fn(),
  newTaskDateTasker: jest.fn(),
  acceptRevision: jest.fn(),
  refuseRevision: jest.fn(),
  completeTask: jest.fn(),
  acceptTaskDate: jest.fn(),
  startTask: jest.fn(),
  confirmCompleteTask: jest.fn(),
  actionTaskTime: jest.fn(),
  taskNotStarted: jest.fn(),
  cancelTaskTasker: jest.fn()
}))

// a v2 change answers nothing (204)
const OK = undefined
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const task = {
  id: 9,
  name: "Ormar",
  status: 1,
  posted_by_user: { id: 6, full_name: "Klijent" },
  accepted_by_user: { id: 7, full_name: "Majstor" },
  offers: [
    { id: 30, status: 1, user_id: 7 },
    { id: 31, status: 0, edit_id: 30 }
  ],
  times: [
    { id: 1, status: 0 },
    { id: 2, status: 0 }
  ]
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "CLIENT", channel: "ch6" } }, userSelect: "CLIENT" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false }, modals: {} })
  useUiStore.setState({ spinners: 0 })
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("what a navigation to My Tasks asks for", () => {
  const props = (over = {}) => ({
    params: undefined,
    navigation: { navigate: mockNavigate, setParams: jest.fn() },
    isFocused: true,
    userSelect: "CLIENT",
    invalidateMyTasks: jest.fn(),
    onSubmitReview: jest.fn(),
    ...over
  })

  it("nothing asked: no tab change; the lists reload when the server says the tasks changed", async () => {
    const p = props()
    await renderHookWithQuery(() => useMyTasksRoute(p))
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(subscribe).toHaveBeenCalledWith("hotovo-refresh-tasks-ch6", expect.any(Function))
    subscribe.mock.calls[0][1]()
    expect(p.invalidateMyTasks).toHaveBeenCalled()
  })

  it("refresh reloads the current tasks and shows them; finished shows that tab", async () => {
    const refresh = props({ params: { refresh: true } })
    await renderHookWithQuery(() => useMyTasksRoute(refresh))
    expect(refresh.invalidateMyTasks).toHaveBeenCalledWith("CLIENT", false)
    expect(mockNavigate).toHaveBeenCalledWith("MyTasksCurrent")

    await renderHookWithQuery(() => useMyTasksRoute(props({ params: { type: "finished" } })))
    expect(mockNavigate).toHaveBeenLastCalledWith("MyTasksFinished")
  })

  it("a review to submit: the finished tab, reloaded, with the review popup", async () => {
    const p = props({ params: { submitReview: { taskId: 9 } } })
    await renderHookWithQuery(() => useMyTasksRoute(p))
    expect(mockNavigate).toHaveBeenCalledWith("MyTasksFinished")
    expect(p.invalidateMyTasks).toHaveBeenCalledWith("CLIENT", true)
    expect(p.onSubmitReview).toHaveBeenCalledWith({ taskId: 9 })
  })

  it("a task from a notification opens over its tab", async () => {
    await renderHookWithQuery(() => useMyTasksRoute(props({ params: { taskdetails: task.id } })))
    expect(mockNavigate.mock.calls).toEqual([["MyTasksCurrent"], ["MyTaskDetails", { taskId: task.id }]])
    mockNavigate.mockClear()
    await renderHookWithQuery(() => useMyTasksRoute(props({ params: { taskdetailsFinished: task.id } })))
    expect(mockNavigate.mock.calls).toEqual([["MyTasksFinished"], ["MyTaskFinished", { taskId: task.id }]])
  })

  it("the same params do not ask twice; handled ones are cleared off the route", async () => {
    const params = { refresh: true }
    const p = props({ params })
    const { rerender } = await renderHookWithQuery(() => useMyTasksRoute(p))
    await act(async () => rerender())
    expect(p.invalidateMyTasks).toHaveBeenCalledTimes(1)
    expect(p.navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({ refresh: undefined, taskdetails: undefined }))
  })
})

describe("a client's active task", () => {
  const actions = () => renderHookWithQuery(() => useTaskDetailsActions(task))

  it("navigates to the offers, the chat and the full details", async () => {
    const { result, client } = await actions()
    result.current.viewOffers()
    result.current.goToMessageUser()
    result.current.openTaskDetails(true)
    expect(mockNavigate.mock.calls).toEqual([
      ["Notifications", { viewOffers: true, taskDetailsId: 9 }],
      ["Chat", { userId: 7, taskId: 9 }],
      ["TaskDetails", { originalTimes: true, taskId: 9 }]
    ])
    expect(client.getQueryData(["task", 9])).toBe(task)
  })

  it("proposing a date needs two dates, then goes to the accepted offer", async () => {
    TasksAPI.newTaskDateTasker.mockResolvedValue(OK)
    const { result } = await actions()
    await act(async () => result.current.proposeNewTaskDate(["a"]))
    expect(alert()).toMatchObject({ text: "Please choose dates" })
    // the user closes it
    await act(async () => hideAlert())
    await act(async () => result.current.proposeNewTaskDate(["a", "b"]))
    expect(TasksAPI.newTaskDateTasker).toHaveBeenCalledWith(30, ["a", "b"])
    expect(alert()).toMatchObject({ type: "success", title: "Task offer new date success" })
  })

  it("canceling asks first, then cancels and goes back to the list", async () => {
    TasksAPI.cancelTask.mockResolvedValue(OK)
    const { result } = await actions()
    await act(async () => result.current.doCancelTask())
    expect(alert()).toMatchObject({ title: "Task cancelation" })
    await act(async () => alert().proceedAction())
    expect(TasksAPI.cancelTask).toHaveBeenCalledWith(9)
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { refresh: true })
    expect(alert()).toMatchObject({ title: "CANCEL TASK" })
  })

  it("a price revision is accepted or declined", async () => {
    TasksAPI.acceptRevision.mockResolvedValue(OK)
    TasksAPI.refuseRevision.mockResolvedValue(OK)
    const { result } = await actions()
    await act(async () => result.current.doAcceptRevision())
    expect(TasksAPI.acceptRevision).toHaveBeenCalledWith(31)
    await act(async () => alert().proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("Notifications", { refreshOffers: true })

    await act(async () => result.current.doDeclineRevision())
    expect(TasksAPI.refuseRevision).toHaveBeenCalledWith(31)
    expect(mockNavigate).toHaveBeenLastCalledWith("MyTasks", { refresh: true })
  })
})

describe("a tasker's accepted task", () => {
  const actions = (setTask = jest.fn(), onBackToList = jest.fn()) => renderHookWithQuery(() => useTaskerTaskActions({ task, setTask, onBackToList }))

  it("completing it goes back to the list", async () => {
    TasksAPI.completeTask.mockResolvedValue(OK)
    const onBackToList = jest.fn()
    const { result } = await actions(jest.fn(), onBackToList)
    await act(async () => result.current.doCompleteTask())
    expect(TasksAPI.completeTask).toHaveBeenCalledWith(9)
    expect(onBackToList).toHaveBeenCalled()
  })

  it("an accepted date is marked on the task", async () => {
    TasksAPI.acceptTaskDate.mockResolvedValue(OK)
    const setTask = jest.fn()
    const { result, client } = await actions(setTask)
    const invalidate = jest.spyOn(client, "invalidateQueries")
    await act(async () => result.current.doAcceptDate(null))
    expect(alert()).toMatchObject({ text: "Please choose time" })
    await act(async () => result.current.doAcceptDate({ id: 2 }))
    expect(setTask.mock.calls[0][0].times).toEqual([
      { id: 1, status: 0 },
      { id: 2, status: 1 }
    ])
    // (an offer screen of the task reloads)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["taskOffer"] })
  })

  it("starting it waits for the client; messaging goes to the client", async () => {
    TasksAPI.startTask.mockResolvedValue(OK)
    TasksAPI.newTaskDateTasker.mockResolvedValue(OK)
    const { result } = await actions()
    await act(async () => result.current.doStartTask("TASKER"))
    expect(TasksAPI.startTask).toHaveBeenCalledWith("TASKER", 30)
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { refresh: true })
    result.current.goToMessageUser()
    expect(mockNavigate).toHaveBeenLastCalledWith("Chat", { userId: 6, taskId: 9 })
    await act(async () => result.current.proposeNewDate(["a", "b"]))
    expect(TasksAPI.newTaskDateTasker).toHaveBeenCalledWith(30, ["a", "b"])
  })
})

describe("the client confirming a completed task", () => {
  const data = { taskId: 9, taskName: "Ormar", postedBy: { id: 6, name: "Klijent" }, acceptedBy: { id: 7, name: "Majstor" } }

  it("the other party is the tasker for the client and the client for the tasker", () => {
    expect(otherParty(data, 6)).toEqual({ id: 7, name: "Majstor" })
    expect(otherParty(data, 7)).toEqual({ id: 6, name: "Klijent" })
    expect(otherParty(null, 6)).toEqual({})
  })

  it("confirms, then goes on to review the tasker", async () => {
    TasksAPI.confirmCompleteTask.mockResolvedValue(OK)
    const onSend = jest.fn()
    const { result } = await renderHookWithQuery(() => useConfirmComplete(data, { onSend }))
    await act(async () => result.current.confirm())
    expect(onSend).toHaveBeenCalled()
    expect(TasksAPI.confirmCompleteTask).toHaveBeenCalledWith(9)
    await act(async () => alert().proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { submitReview: expect.objectContaining({ taskId: 9, userIdClient: 7, userName: "Majstor", type: "CLIENT" }) })
  })

  it("without a task id nothing is sent", async () => {
    const { result } = await renderHookWithQuery(() => useConfirmComplete({ ...data, taskId: null }, { onSend: jest.fn() }))
    await act(async () => result.current.confirm())
    expect(TasksAPI.confirmCompleteTask).not.toHaveBeenCalled()
  })
})

describe("answering a proposed time", () => {
  const data = { taskId: 9, timeId: { id: 5, user_id: 7 }, acceptedBy: { id: 7 } }

  it("accepting closes the modal", async () => {
    TasksAPI.actionTaskTime.mockResolvedValue(OK)
    const close = jest.fn()
    const { result } = await renderHookWithQuery(() => useNewTimeAnswer(data, close))
    await act(async () => result.current.accept())
    expect(TasksAPI.actionTaskTime).toHaveBeenCalledWith(5, 1)
    expect(close).toHaveBeenCalled()
  })

  it("declining explains and opens the chat with the other party", async () => {
    TasksAPI.actionTaskTime.mockResolvedValue(OK)
    const { result } = await renderHookWithQuery(() => useNewTimeAnswer(data, jest.fn()))
    await act(async () => result.current.decline())
    expect(TasksAPI.actionTaskTime).toHaveBeenCalledWith(5, 3)
    expect(alert()).toMatchObject({ title: "Task time declined" })
    expect(mockNavigate).toHaveBeenCalledWith("Chat", { userId: 7, taskId: 9 })
  })
})

describe("answering a started task", () => {
  const data = { taskOffer: { id: 30 }, postedBy: { id: 6 }, acceptedByUser: { id: 7 } }

  it("yes starts it on the client's side, no reports it not started", async () => {
    TasksAPI.startTask.mockResolvedValue(OK)
    TasksAPI.taskNotStarted.mockResolvedValue(OK)
    const close = jest.fn()
    const { result } = await renderHookWithQuery(() => useStartedTaskAnswer(data, close))
    expect(result.current.other).toEqual({ id: 7 })
    await act(async () => result.current.confirm())
    expect(TasksAPI.startTask).toHaveBeenCalledWith("CLIENT", 30)
    expect(alert()).toMatchObject({ title: "TASK STARTED" })
    await act(async () => result.current.deny())
    expect(TasksAPI.taskNotStarted).toHaveBeenCalledWith(30)
    expect(close).toHaveBeenCalledTimes(2)
  })
})

describe("a tasker canceling a task", () => {
  it("finds the accepted offer", () => {
    expect(acceptedOfferOf(task)).toEqual({ id: 30, status: 1, user_id: 7 })
    expect(acceptedOfferOf(null)).toEqual({ user: {} })
  })

  it("needs a reason, then cancels and shows the offers again", async () => {
    TasksAPI.cancelTaskTasker.mockResolvedValue(OK)
    const close = jest.fn()
    const { result } = await renderHookWithQuery(() => useTaskerCancel(task, close))
    await act(async () => result.current.submit())
    expect(alert()).toMatchObject({ text: "Please enter explanation." })
    await act(async () => result.current.setReason("Bolestan sam"))
    await act(async () => result.current.submit())
    expect(close).toHaveBeenCalled()
    expect(TasksAPI.cancelTaskTasker).toHaveBeenCalledWith(30, "Bolestan sam")
    expect(mockNavigate).toHaveBeenCalledWith("Notifications", { refreshOffers: true })
    expect(result.current.reason).toBe("")
  })
})

describe("prompts when a task arrives", () => {
  it("a proposed time opens the answer modal", async () => {
    const proposed = { ...task, proposed_time: [{ id: 5, date: "2026-10-08", start: "10:00", end: "12:00", user_id: 7 }] }
    await renderHookWithQuery(() => useProposedTimePrompt(proposed, { id: 7, full_name: "Majstor" }))
    expect(useModalStore.getState().modals.newTime).toMatchObject({ open: true, data: { taskId: 9, type: "new-task-time" } })
  })

  it("a task the tasker started asks the client to confirm", async () => {
    jest.useFakeTimers()
    await renderHookWithQuery(() => useStartedTaskPrompt({ ...task, status: 8 }))
    await act(async () => jest.advanceTimersByTime(1000))
    expect(useModalStore.getState().modals.startedTask).toMatchObject({ open: true, data: { taskId: 9 } })
  })
})
