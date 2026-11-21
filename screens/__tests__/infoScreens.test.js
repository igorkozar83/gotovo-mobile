import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import { BackHandler, Linking } from "react-native"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation, setRoute, route } from "../../testUtils/navigation"
import { answerEmpty, pageOf, refused, TasksAPI } from "../../testUtils/api"
import { client, tasker, taskOf, finishedTask } from "../../testUtils/fixtures"
import { user as userApi } from "../../Services/API"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import HomeScreen from "../Home"
import SliderPage from "../SliderPage"
import Contact from "../Contact"
import TermsAndConditions, { Faq, PrivacyPolicy } from "../TermsAndConditions"
import TaskerProfile from "../TaskerProfile"
import MyReviews from "../MyReviews"
import TaskDetailsTasker from "../TaskDetailsTasker"
import MyTaskFinished from "../MyTaskFinished"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/TasksAPI")
jest.mock("../../Services/NotificationsAPI")
jest.mock("../../Services/UsersAPI")
jest.mock("../../Services/PaymentsAPI")
jest.mock("../../Services/API")
jest.mock("../../hooks/useLiveChannel", () => jest.fn())

const as = (type, userData = {}) =>
  useAuthStore.setState({
    user: { loggedIn: true, userData: { ...(type === "CLIENT" ? client : tasker), type, verifications: { verified_tasker: 1 }, ...userData } },
    userSelect: type
  })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const SETTINGS = {
  buttons: [{ id: 1, text: "Popular" }],
  services: [{ id: 1, category: 1, blackText: "Fix a leak", additionalText: "plumbing", image: "a.jpg", categoryId: 1, tasks: [] }],
  clientSlider: [],
  taskerSlider: [],
  settings: { currency: "rsd", languages: [] },
  translations: null
}
const withSettings = () => {
  const queryClient = makeQueryClient()
  queryClient.setQueryData(["appSettings"], SETTINGS)
  return queryClient
}
const page = (items) => pageOf(items)

beforeEach(() => {
  jest.clearAllMocks()
  answerEmpty()
  as("CLIENT")
  setRoute({ name: "Home" })
  useUiStore.setState({ language: "EN", selectedCat: null, authOpen: false, spinners: 0 })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
})

describe("Home", () => {
  it("after registering it opens the login with the new email", async () => {
    setRoute({ name: "Home", params: { registerSuccess: "ana@example.test" } })
    await renderWithQuery(<HomeScreen route={route} />, withSettings())
    expect(useUiStore.getState().authOpen).toBe(true)
    expect(useAuthStore.getState().preEmail).toBe("ana@example.test")
  })

  it("Android back asks before leaving the app; EXIT leaves", async () => {
    const exitApp = jest.spyOn(BackHandler, "exitApp").mockImplementation(() => {})
    const listeners = []
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((event, handler) => {
      listeners.push(handler)
      return { remove: jest.fn() }
    })
    await renderWithQuery(<HomeScreen route={route} />, withSettings())
    expect(listeners.pop()()).toBe(true)
    expect(alert()).toMatchObject({ open: true, title: "Confirm exit app", proceedText: "EXIT", cancelText: "CANCEL" })
    await act(async () => alert().proceedAction())
    expect(exitApp).toHaveBeenCalled()
  })

  it("a tasker's: the open tasks load, an unverified tasker is told why offers are locked", async () => {
    as("TASKER", { verifications: { verified_tasker: 0 } })
    TasksAPI.getTasksTasker.mockResolvedValue(page([taskOf()]))
    await renderWithQuery(<HomeScreen route={route} />, withSettings())
    expect(TasksAPI.getTasksTasker).toHaveBeenCalled()
    expect(await screen.findByLabelText("Fix the tap")).toBeTruthy()
    expect(alert()).toMatchObject({ open: true })
  })

  it("a tasker's search is sent when submitted", async () => {
    as("TASKER")
    await renderWithQuery(<HomeScreen route={route} />, withSettings())
    await act(async () => fireEvent.changeText(screen.getByLabelText("find a project"), "paint"))
    await act(async () => fireEvent(screen.getByLabelText("find a project"), "endEditing"))
    expect(TasksAPI.getTasksTasker.mock.lastCall.pop()).toMatchObject({ filter_job: "paint" })
  })
})

describe("the information pages", () => {
  it("a slide's page: its texts, its prices and a link button", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue()
    const slide = {
      image: "s.jpg",
      text: "Need help",
      black_text: "at home?",
      top_text: "Top",
      options: [{ text: "Cleaning", value: 2000 }],
      button_type: 2,
      button_text: "OPEN",
      button_action: "https://gotovo.rs"
    }
    await renderWithQuery(<SliderPage route={{ params: { slide } }} />, withSettings())
    expect(screen.getByText("Cleaning")).toBeTruthy()
    expect(screen.getByText("2000 RSD")).toBeTruthy()
    await press("OPEN")
    expect(openURL).toHaveBeenCalledWith("https://gotovo.rs")
  })

  it("a slide's page in the app's language: the English texts in English, the slide's own otherwise", async () => {
    const slide = {
      image: "s.jpg",
      text: "Treba vam pomoć",
      black_text: "kod kuće?",
      top_text: "Vrh",
      options: [],
      translations: { EN: { text: "Need help", image: "s-en.jpg", top_text: "" } }
    }
    await renderWithQuery(<SliderPage route={{ params: { slide } }} />, withSettings())
    expect(screen.getByText("Need help")).toBeTruthy()
    // (no English one given: the slide's own)
    expect(screen.getByText("kod kuće?")).toBeTruthy()
    expect(screen.getByText("Vrh")).toBeTruthy()

    try {
      await act(async () => useUiStore.setState({ language: "SR" }))
      expect(screen.getByText("Treba vam pomoć")).toBeTruthy()
    } finally {
      useUiStore.setState({ language: "EN" })
    }
  })

  it("a slide without a heading starts its text right under the picture", async () => {
    await renderWithQuery(<SliderPage route={{ params: { slide: { image: "s.jpg", text: null, black_text: null, top_text: "Reklame", options: [] } } }} />, withSettings())
    expect(screen.getByText("Reklame")).toBeTruthy()
    expect(screen.queryByTestId("slide-heading")).toBeNull()
  })

  it("contact: the support email opens the mail app", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue()
    await renderWithQuery(<Contact />, withSettings())
    await press("hello@gotovo.rs")
    expect(openURL).toHaveBeenCalledWith("mailto:hello@gotovo.rs")
  })

  it("the terms go back with OK", async () => {
    await renderWithQuery(<TermsAndConditions />, withSettings())
    expect(screen.getByText("OPŠTI USLOVI I PRAVILA KORIŠĆENJA ZA KORISNIKE")).toBeTruthy()
    await press("OK, I GOT IT")
    expect(navigation.goBack).toHaveBeenCalled()
  })

  it("the FAQ and the privacy policy show their own texts", async () => {
    await renderWithQuery(<Faq />, withSettings())
    expect(screen.getByText("Frequently Asked Questions")).toBeTruthy()
    expect(screen.getByText(/^1\. Šta je GOTOVO\?/)).toBeTruthy()
    await renderWithQuery(<PrivacyPolicy />, withSettings())
    expect(screen.getByText("Privacy Policy")).toBeTruthy()
    expect(screen.getByText("Definicije")).toBeTruthy()
  })
})

describe("profiles and reviews", () => {
  const review = {
    id: 1,
    user: client,
    user_id: client.id,
    task: { id: 9, name: "Fix the tap", posted_by: client.id },
    five_star: 1,
    message: "Great work",
    created_at: "2026-10-01 10:00:00",
    review_images: []
  }

  it("another user's profile: who, their reviews by stars and the reviews", async () => {
    TasksAPI.getReviews.mockResolvedValue(pageOf([review]))
    await renderWithQuery(<TaskerProfile route={{ params: { profile: { ...tasker, reviews: { total: 1, five_star: 1 } } } }} />, withSettings())
    expect(screen.getByText("Pera")).toBeTruthy()
    expect(await screen.findByText("Great work")).toBeTruthy()
    expect(screen.queryByText("Wish to reply to this review?")).toBeNull()
  })

  it("one's own reviews can be replied to", async () => {
    TasksAPI.getReviews.mockResolvedValue(pageOf([review]))
    await renderWithQuery(<MyReviews />, withSettings())
    await screen.findByText("Wish to reply to this review?")
    await press("Wish to reply to this review?")
    expect(screen.getByText("REPLY TO REVIEW")).toBeTruthy()
  })

  it("one's own summary on top is loaded again with the reviews, so its counts match the list", async () => {
    TasksAPI.getReviews.mockResolvedValue(pageOf([review]))
    userApi.mockResolvedValue({ ...client, type: "CLIENT", tasks_count: 7, reviews: { total: 2, five_star: 2 } })
    await renderWithQuery(<MyReviews />, withSettings())
    await screen.findByText("Great work")
    expect(userApi).toHaveBeenCalled()
    expect(useAuthStore.getState().user.userData.tasks_count).toBe(7)
  })
})

describe("a task as a tasker sees it", () => {
  it("its facts, the times and the place; asking and offering", async () => {
    as("TASKER")
    const task = taskOf({ sub_category_task: { image: "a.png", image_task_details: "b.png", description: "Plumbing" }, posted_by: client.id })
    TasksAPI.getTaskById.mockResolvedValue(task)
    await renderWithQuery(<TaskDetailsTasker route={{ params: { taskId: task.id } }} />, withSettings())
    await screen.findByText("Plumbing")
    expect(TasksAPI.getTaskById).toHaveBeenCalledWith(task.id)
    expect(screen.getByText("Plumbing")).toBeTruthy()
    expect(TasksAPI.getTaskQuestions).toHaveBeenCalledWith(9)
    await press("ASK A QUESTION")
    expect(screen.getAllByText("ASK A QUESTION").length).toBeGreaterThan(1)
    await press("PROPOSE AN OFFER")
    // the terms come first
    expect(alert()).toMatchObject({ open: true })
  })

  it("the client's photo opens the client's profile", async () => {
    as("TASKER")
    const task = taskOf({ sub_category_task: { image: "a.png", image_task_details: "b.png", description: "Plumbing" }, posted_by: client.id, posted_by_user: client })
    TasksAPI.getTaskById.mockResolvedValue(task)
    await renderWithQuery(<TaskDetailsTasker route={{ params: { taskId: task.id } }} />, withSettings())
    await screen.findByText("Plumbing")
    await act(async () => fireEvent.press(screen.getByLabelText("Client profile")))
    expect(navigation.navigate).toHaveBeenCalledWith("TaskerProfile", { profile: expect.objectContaining({ id: client.id }) })
  })
})

describe("a task that can't be loaded", () => {
  it("says why", async () => {
    TasksAPI.getTaskById.mockRejectedValue(refused(404, "not_found", "This task no longer exists."))
    await renderWithQuery(<TaskDetailsTasker route={{ params: { taskId: 9 } }} />, withSettings())
    expect(await screen.findByText("This task no longer exists.")).toBeTruthy()
  })
})

describe("a finished task", () => {
  it("shows the task and goes to the original task and the offers", async () => {
    const task = finishedTask()
    const queryClient = withSettings()
    queryClient.setQueryData(["task", task.id], task)
    TasksAPI.getTaskById.mockResolvedValue(task)
    const { client } = await renderWithQuery(<MyTaskFinished route={{ params: { taskId: task.id } }} />, queryClient)
    await press("VIEW ORIGINAL TASK")
    expect(client.getQueryData(["task", task.id])).toEqual(task)
    expect(navigation.navigate).toHaveBeenCalledWith("TaskDetails", { originalTimes: true, taskId: task.id })
    await press("VIEW RECEIVED OFFERS")
    expect(navigation.navigate).toHaveBeenCalledWith("Notifications", { viewOffers: true, taskDetailsId: 9 })
  })
})
