import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation, setRoute, route } from "../../testUtils/navigation"
import { answerEmpty, pageOf, refused, TasksAPI, NotificationsAPI, UsersAPI, API } from "../../testUtils/api"
import { client, tasker, taskOf, offerOf, timeOf, acceptedTask, finishedTask } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import MyTasksCurrent from "../myTasks/MyTasksCurrent"
import MyTasksFinished from "../myTasks/MyTasksFinished"
import MyTasksCalendar from "../myTasks/MyTasksCalendar"
import MyTaskDetails from "../MyTaskDetails"
import InboxOffers from "../inbox/InboxOffers"
import InboxQuestions from "../inbox/InboxQuestions"
import InboxChats from "../inbox/InboxChats"
import InboxNotifications from "../inbox/InboxNotifications"
import { InboxParamsContext } from "../inbox/InboxParams"
import Chat from "../Chat"
import TaskOffer from "../TaskOffer"
import Profile from "../Profile"
import IncomeAccounts from "../IncomeAccounts"
import PostTask from "../PostTask"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/TasksAPI")
jest.mock("../../Services/NotificationsAPI")
jest.mock("../../Services/UsersAPI")
jest.mock("../../Services/PaymentsAPI")
jest.mock("../../Services/API")
jest.mock("../../hooks/useLiveChannel", () => jest.fn())

const as = (type, userData = {}) =>
  useAuthStore.setState({
    user: { loggedIn: true, userData: { ...(type === "CLIENT" ? client : tasker), type, verifications: { verified_tasker: 1 }, addresses: [], ...userData } },
    userSelect: type
  })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
// the task's screen opened by its id, the task already loaded (as from its list) and on the server
const renderMyTask = (task) => {
  const queryClient = withSettings()
  queryClient.setQueryData(["task", task.id], task)
  TasksAPI.getTaskById.mockResolvedValue(task)
  return renderWithQuery(<MyTaskDetails route={{ params: { taskId: task.id } }} />, queryClient)
}
const withSettings = () => {
  const queryClient = makeQueryClient()
  queryClient.setQueryData(["appSettings"], {
    buttons: [{ id: 1, text: "Popular", tasks: [{ id: 30, description: "Fix a leak", options: [] }] }],
    services: [],
    clientSlider: [],
    taskerSlider: [],
    settings: { currency: "rsd", fee: ["100", "200", "300"], languages: [] },
    translations: null
  })
  return queryClient
}
const tasksPage = (tasks) => pageOf(tasks)

beforeEach(() => {
  jest.clearAllMocks()
  answerEmpty()
  as("CLIENT")
  setRoute({ name: "Test" })
  useUiStore.setState({ language: "EN", selectedCat: 1, spinners: 0 })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
})

describe("My Tasks", () => {
  it("the current tasks load and one opens its details; the tabs go to the others", async () => {
    TasksAPI.getTasks.mockResolvedValue(tasksPage([taskOf()]))
    await renderWithQuery(<MyTasksCurrent navigation={navigation} />, withSettings())
    await press(await screen.findByText("Fix the tap").then(() => "Fix the tap"))
    expect(navigation.navigate).toHaveBeenCalledWith("MyTaskDetails", { taskId: 9 })
    await press("FINISHED")
    expect(navigation.navigate).toHaveBeenCalledWith("MyTasksFinished")
  })

  it("the finished tab and the calendar load theirs", async () => {
    await renderWithQuery(<MyTasksFinished navigation={navigation} />, withSettings())
    expect(TasksAPI.getTasks).toHaveBeenCalledWith(null, true)
    await renderWithQuery(<MyTasksCalendar navigation={navigation} />, withSettings())
    expect(NotificationsAPI.getCalendar).toHaveBeenCalled()
    await press("CURRENT")
    expect(navigation.navigate).toHaveBeenCalledWith("MyTasksCurrent")
  })

  it("no tasks yet says so", async () => {
    await renderWithQuery(<MyTasksCurrent navigation={navigation} />, withSettings())
    expect(await screen.findByText("NO TASKS POSTED YET")).toBeTruthy()
  })
})

describe("an active task's details", () => {
  it("a client's open task: waiting for offers, cancel free of charge", async () => {
    await renderMyTask(taskOf())
    expect(screen.getByText("Waiting for taskers to send offers")).toBeTruthy()
    expect(screen.getByText("NOTE:")).toBeTruthy()
    await press("CANCEL THIS TASK")
    expect(alert()).toMatchObject({ open: true })
  })

  it("a client's scheduled task can get another time", async () => {
    await renderMyTask(acceptedTask())
    await press("Do you need to change this task's time?")
    expect(screen.getByText("PICK DATE AND TIME")).toBeTruthy()
  })

  it("a task waiting for the client to confirm it complete", async () => {
    const requestConfirmTask = jest.fn()
    useModalStore.setState({ requestConfirmTask })
    await renderMyTask(acceptedTask({ status: 3, posted_by: client.id }))
    await press("CONFIRM COMPLETE")
    expect(requestConfirmTask).toHaveBeenCalledWith(expect.objectContaining({ id: 9 }))
  })

  it("the tasker's view of their accepted task", async () => {
    as("TASKER")
    await renderMyTask(acceptedTask({ times: [timeOf({ status: 1 })] }))
    expect(screen.getByText("MY OFFER")).toBeTruthy()
  })
})

describe("the inbox tabs", () => {
  it("offers: lists the offers; the inbox bar goes to another tab", async () => {
    TasksAPI.getTaskOffers.mockResolvedValue(pageOf([offerOf({ task: taskOf() })]))
    await renderWithQuery(<InboxOffers navigation={navigation} />, withSettings())
    expect(await screen.findByText("NEW OFFER")).toBeTruthy()
    await press("CHAT")
    expect(navigation.navigate).toHaveBeenCalledWith("InboxChats")
  })

  it("offers, opened from a task: only that task's", async () => {
    TasksAPI.getTaskOffers.mockResolvedValue(pageOf([]))
    await renderWithQuery(
      <InboxParamsContext.Provider value={{ viewOffers: true, taskDetailsId: 9 }}>
        <InboxOffers navigation={navigation} />
      </InboxParamsContext.Provider>,
      withSettings()
    )
    await act(async () => {})
    expect(TasksAPI.getTaskOffers.mock.calls[0][1]).toMatchObject({ task_id: 9 })
  })

  it("chats: lists the conversations; one opens its chat", async () => {
    const conversation = { first_user: client, second_user: tasker, task: { name: "Fix the tap" }, messages: [], messages_count: 0 }
    NotificationsAPI.getConversations.mockResolvedValue(pageOf([conversation]))
    await renderWithQuery(<InboxChats navigation={navigation} />, withSettings())
    await screen.findByText("Fix the tap")
    await press("Fix the tap")
    expect(navigation.navigate).toHaveBeenCalledWith("Chat", { conversation })
  })

  it("questions: load theirs; a tasker's are marked read", async () => {
    as("TASKER")
    TasksAPI.readTasksQuestionsTasker.mockResolvedValue(undefined)
    await renderWithQuery(<InboxQuestions navigation={navigation} />, withSettings())
    expect(TasksAPI.getAllTaskQuestions).toHaveBeenCalled()
    expect(TasksAPI.readTasksQuestionsTasker).toHaveBeenCalled()
  })

  it("notifications: load theirs; a failed load says so", async () => {
    NotificationsAPI.getNotifications.mockRejectedValue(refused(500, "server_error", "Server Error"))
    await renderWithQuery(<InboxNotifications navigation={navigation} />, withSettings())
    await act(async () => {})
    expect(NotificationsAPI.getNotifications).toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Error while retrieving conversation" })
  })
})

describe("the chat", () => {
  it("shows the messages; a typed one is sent", async () => {
    const conversation = { id: 4, first_user: client, second_user: tasker, task: { id: 9, name: "Fix the tap" } }
    NotificationsAPI.getMessages.mockResolvedValue(pageOf([{ id: 1, user_id: tasker.id, user: tasker, message: "On my way", created_at: "2026-10-01T10:00:00" }]))
    NotificationsAPI.sendMessage.mockResolvedValue({ id: 2, user_id: client.id, user: client, message: "Thanks", created_at: "2026-10-01T10:05:00" })
    await renderWithQuery(<Chat route={{ params: { conversation } }} />, withSettings())
    expect(await screen.findByText("On my way")).toBeTruthy()
    await act(async () => fireEvent.changeText(screen.getByLabelText("Type a message..."), "Thanks"))
    await act(async () => fireEvent.press(screen.getByLabelText("Send")))
    expect(NotificationsAPI.sendMessage).toHaveBeenCalled()
  })

  it("back returns to where it was opened from; the inbox tabs on top open their tab", async () => {
    await renderWithQuery(<Chat route={{ params: { conversation: { id: 4, task: { name: "Fix the tap" } } } }} />, withSettings())
    await act(async () => fireEvent.press(screen.getAllByLabelText("Back")[0]))
    expect(navigation.goBack).toHaveBeenCalled()
    await press("OFFERS")
    expect(navigation.navigate).toHaveBeenCalledWith("Notifications", { tab: "OFFERS" })
  })

  it("opened for a person and a task, it finds their conversation", async () => {
    await renderWithQuery(<Chat route={{ params: { userId: tasker.id, taskId: 9 } }} />, withSettings())
    expect(NotificationsAPI.checkConversation).toHaveBeenCalled()
  })
})

describe("an offer's details", () => {
  // the screen opened for the offer's id; the offer comes from the API
  const renderOffer = async (offer) => {
    TasksAPI.getTaskOffer.mockResolvedValue(offer)
    await renderWithQuery(<TaskOffer route={{ params: { offerId: offer.id } }} />, withSettings())
    await screen.findByText(offer.task.name)
  }

  it("an offer that can't be loaded says why", async () => {
    TasksAPI.getTaskOffer.mockRejectedValue(refused(404, "not_found", "This offer no longer exists."))
    await renderWithQuery(<TaskOffer route={{ params: { offerId: 30 } }} />, withSettings())
    expect(await screen.findByText("This offer no longer exists.")).toBeTruthy()
  })

  it("the client accepts a new offer after agreeing to the terms", async () => {
    TasksAPI.acceptTaskOffer.mockResolvedValue({ accepted_time: null })
    await renderOffer(offerOf({ task: taskOf({ posted_by: client.id }) }))
    await press("ACCEPT OFFER")
    expect(TasksAPI.acceptTaskOffer).not.toHaveBeenCalled()
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    await press("ACCEPT OFFER")
    expect(TasksAPI.acceptTaskOffer).toHaveBeenCalled()
  })

  it("the tasker sees their sent offer and can cancel it", async () => {
    as("TASKER")
    await renderOffer(offerOf({ user_id: tasker.id, task: taskOf({ offered: true }) }))
    expect(screen.getByText("OFFER SENT")).toBeTruthy()
    await press("Something came up, cancel offer?")
    expect(alert()).toMatchObject({ open: true })
  })

  it("the tasker sees the client with the client's own count of tasks", async () => {
    as("TASKER")
    const poster = { ...client, tasks_count_client: 37 }
    await renderOffer(offerOf({ user: { ...tasker, tasks_count_client: 412 }, task: taskOf({ offered: true, posted_by_user: poster }) }))
    expect(screen.getAllByText("37").length).toBeGreaterThan(0)
    expect(screen.queryByText("412")).toBeNull()
  })
})

describe("the profile", () => {
  it("the sections of a client's own profile; the password modal opens", async () => {
    as("CLIENT", { email: "ana@example.test", languages: [{ language: "sr" }], sex: 1, age: 1990 })
    await renderWithQuery(<Profile />, withSettings())
    expect(screen.getByText("GENERAL DATA")).toBeTruthy()
    expect(screen.queryByText("LICENCE, CERTIFICATES, ID")).toBeNull()
    await press("CHANGE PASSWORD")
    expect(screen.getAllByText("CHANGE PASSWORD").length).toBeGreaterThan(1)
  })

  it("a tasker's has the documents, and no income accounts (a screen of their own)", async () => {
    as("TASKER", { user_images: [] })
    await renderWithQuery(<Profile />, withSettings())
    expect(screen.getByText("LICENCE, CERTIFICATES, ID")).toBeTruthy()
    expect(screen.queryByText("SAVED ACCOUNTS")).toBeNull()
  })

  it("the income accounts: their own title and the saved accounts", async () => {
    as("TASKER", { user_images: [] })
    await renderWithQuery(<IncomeAccounts />, withSettings())
    expect(screen.getByLabelText("Income accounts")).toBeTruthy()
    expect(screen.getByText("SAVED ACCOUNTS")).toBeTruthy()
  })

  it("removing a document asks first, then removes it", async () => {
    as("TASKER", { user_images: [{ id: 5, image: "https://x/id.jpg" }] })
    // the user reloaded after it
    API.user.mockResolvedValue({ ...tasker, type: "TASKER", user_images: [] })
    await renderWithQuery(<Profile />, withSettings())
    await act(async () => fireEvent.press(screen.getByLabelText("Remove photo")))
    await press("REMOVE PHOTO")
    expect(UsersAPI.deleteUserImage).toHaveBeenCalledWith(5)
  })
})

describe("posting a task", () => {
  it("a logged-in client's form: the job, the place and GET OFFERS", async () => {
    await renderWithQuery(<PostTask route={route} />, withSettings())
    expect(screen.getByText("GET OFFERS")).toBeTruthy()
    expect(screen.queryByText("ACCOUNT DETAILS")).toBeNull()
    await press("GET OFFERS")
    // an empty form is not sent
    expect(TasksAPI.createTask).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true })
  })

  it("a guest also registers", async () => {
    useAuthStore.setState({ user: { loggedIn: false, userData: {} }, userSelect: "CLIENT" })
    await renderWithQuery(<PostTask route={route} />, withSettings())
    expect(screen.getByText("ACCOUNT DETAILS")).toBeTruthy()
    expect(screen.getByText("REGISTER + CONFIRM")).toBeTruthy()
  })

  it("an S.O.S. task is titled so from the first opening", async () => {
    setRoute({ name: "PostTask", params: { isSos: true } })
    await renderWithQuery(<PostTask route={route} />, withSettings())
    expect(screen.getByText("S.O.S.")).toBeTruthy()
  })

  it("posting a task again starts from the old one", async () => {
    TasksAPI.getTaskById.mockResolvedValue(finishedTask({ name: "Fix the tap again", description: "Same tap", is_sos: 1 }))
    setRoute({ name: "PostTask", params: { repost: 9 } })
    await renderWithQuery(<PostTask route={route} />, withSettings())
    await act(async () => {})
    expect(TasksAPI.getTaskById).toHaveBeenCalledWith(9)
    expect(screen.getByLabelText("TASK NAME").props.value).toBe("Fix the tap again")
    expect(screen.getByText("S.O.S.")).toBeTruthy()
  })
})
