import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import { BackHandler, Keyboard } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation, setRoute } from "../../testUtils/navigation"
import { client, tasker } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import Header, { barTop } from "../Header"
import BottomNavigation from "../BottomNavigation"
import ModalManager from "../ModalManager"
import AppSession from "../AppSession"
import Main from "../Main"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/NotificationsAPI", () => ({ countNotifications: jest.fn(() => new Promise(() => {})) }))
jest.mock("../../Services/settingsAPI", () => ({ getSettings: jest.fn(() => new Promise(() => {})) }))
jest.mock("expo-screen-orientation", () => ({ lockAsync: jest.fn(), OrientationLock: { PORTRAIT_UP: 1 } }))
const mockLastResponse = { current: null }
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  useLastNotificationResponse: () => mockLastResponse.current,
  clearLastNotificationResponse: jest.fn()
}))
// what Main and AppSession start for the whole app has its own tests (hooks/__tests__/mainHooks): here, that
// they are started and wired
const mockMain = { register: jest.fn(), routeNotification: jest.fn(), routeLiveModal: jest.fn(), liveChannels: jest.fn(), appData: jest.fn(), connection: jest.fn() }
jest.mock("../../hooks/main/usePushRegistration", () => () => ({ register: mockMain.register }))
jest.mock("../../hooks/main/useNotificationRouter", () => () => ({ routeNotification: mockMain.routeNotification, routeLiveModal: mockMain.routeLiveModal }))
jest.mock(
  "../../hooks/main/useLiveChannels",
  () =>
    (...args) =>
      mockMain.liveChannels(...args)
)
jest.mock("../../hooks/main/useAppData", () => () => mockMain.appData())
jest.mock("../../hooks/main/useConnectionAlert", () => () => mockMain.connection())
jest.mock("../../hooks/main/useLanguageSetup", () => ({ __esModule: true, default: jest.fn(), chooseLanguage: jest.fn() }))
jest.mock("../../hooks/main/useSessionStart", () => () => jest.fn())
jest.mock("../../hooks/main/useRoleSync", () => jest.fn())

const as = (type, { loggedIn = true, ...userData } = {}) =>
  useAuthStore.setState({
    user: { loggedIn, userData: loggedIn ? { ...(type === "CLIENT" ? client : tasker), type, verifications: { verified_tasker: 1 }, channel: "abc", ...userData } : {} },
    userSelect: type
  })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const pressLabel = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
// Android back handlers registered (the header registers none: back is the navigator's)
const backHandlers = []

beforeEach(() => {
  jest.clearAllMocks()
  as("CLIENT")
  setRoute({ name: "Home" })
  useUiStore.setState({ language: "EN", openMenuContext: false, headerMenuOpen: false, authOpen: false, selectedJobId: 5 })
  useModalStore.setState({ ...initialModals, modals: {}, mainAlert: { open: false } })
  backHandlers.length = 0
  jest.spyOn(BackHandler, "addEventListener").mockImplementation((event, handler) => {
    backHandlers.push(handler)
    return { remove: jest.fn() }
  })
})

describe("the header", () => {
  it("on iOS clears the status bar and the notch, never less than it always did; Android keeps its 30", () => {
    expect(barTop(0, "ios")).toBe(30)
    expect(barTop(24, "ios")).toBe(30)
    expect(barTop(59, "ios")).toBe(65)
    expect(barTop(52, "android")).toBe(30)
  })

  it("the logo goes Home and the menu opens; Android back is left to the navigator", async () => {
    await renderWithQuery(<Header />)
    await pressLabel("HOME")
    expect(navigation.navigate).toHaveBeenCalledWith("Home")
    await pressLabel("Menu")
    expect(useUiStore.getState().openMenuContext).toBe(true)
    expect(BackHandler.addEventListener).not.toHaveBeenCalled()
  })

  it("a screen opened over another: the arrow goes back", async () => {
    await renderWithQuery(<Header back />)
    expect(screen.queryByLabelText("HOME")).toBeNull()
    await pressLabel("Back")
    expect(navigation.goBack).toHaveBeenCalledTimes(1)
  })

  it("a tasker sees the tasker logo where the screen asks for it", async () => {
    as("TASKER")
    await renderWithQuery(<Header taskerLogo />)
    expect(screen.getByLabelText("HOME")).toBeTruthy()
  })
})

describe("the bottom bar", () => {
  const withCount = (type, total) => {
    const queryClient = makeQueryClient()
    queryClient.setQueryData(["inboxCount", type], { count_questions: total, count_offers: 0, count_messages: 0, count_notifications: 0 })
    return queryClient
  }
  // the tab navigator's state: `front` is the tab in front, `shown` the screen on top of its stack
  const tabState = (front = "HomeTab", shown) => {
    const tabs = ["HomeTab", "InboxTab", "MyTasksTab", "ProfileTab"]
    return {
      index: tabs.indexOf(front),
      routes: tabs.map((name) => ({ name, key: name + "-key", ...(name === front && shown ? { state: { index: 0, routes: [{ name: shown }] } } : {}) }))
    }
  }
  const tabNavigation = { navigate: jest.fn(), emit: jest.fn(() => ({ defaultPrevented: false })) }
  const bar = (front, shown) => <BottomNavigation state={tabState(front, shown)} navigation={tabNavigation} />
  const lit = (label) => screen.getAllByLabelText(label).pop().props.accessibilityState.selected

  it("a client's tabs, the unread count, and posting a task starts without a job", async () => {
    await renderWithQuery(bar(), withCount("CLIENT", 3))
    expect(screen.getByText("3")).toBeTruthy()
    await pressLabel("INBOX")
    expect(tabNavigation.emit).toHaveBeenCalledWith({ type: "tabPress", target: "InboxTab-key", canPreventDefault: true })
    expect(tabNavigation.navigate).toHaveBeenCalledWith("InboxTab")
    await press("POST A TASK")
    expect(useUiStore.getState().selectedJobId).toBe(null)
    expect(tabNavigation.navigate).toHaveBeenCalledWith("PostTask")
    await pressLabel("PROFILE")
    expect(tabNavigation.navigate).toHaveBeenCalledWith("ProfileTab")
  })

  it("the tab in front is lit, also under a screen opened on top of it", async () => {
    await renderWithQuery(bar("MyTasksTab", "TaskOffer"))
    expect(lit("MY TASKS")).toBe(true)
    expect(lit("HOME")).toBe(false)
  })

  it("posting a task lights no tab", async () => {
    await renderWithQuery(bar("HomeTab", "PostTask"))
    expect(lit("HOME")).toBe(false)
  })

  it("a tab whose press was handled (its stack went back to its root) is not navigated to", async () => {
    tabNavigation.emit.mockReturnValueOnce({ defaultPrevented: true })
    await renderWithQuery(bar())
    await pressLabel("HOME")
    expect(tabNavigation.navigate).not.toHaveBeenCalled()
  })

  it("is not shown on a task's details", async () => {
    await renderWithQuery(bar("MyTasksTab", "MyTaskDetails"))
    expect(screen.queryByLabelText("HOME")).toBeNull()
  })

  it("logged out: the inbox and tasks do nothing, the profile asks to log in", async () => {
    as("CLIENT", { loggedIn: false })
    await renderWithQuery(bar())
    expect(screen.queryByLabelText("INBOX")).toBeNull()
    await pressLabel("PROFILE")
    expect(useUiStore.getState().authOpen).toBe(true)
  })

  it("an unverified tasker's inbox explains why it is locked; no post-a-task tab", async () => {
    as("TASKER", { verifications: { verified_tasker: 0 } })
    await renderWithQuery(bar(), withCount("TASKER", 0))
    expect(screen.queryByText("POST A TASK")).toBeNull()
    await pressLabel("MY TASKS")
    expect(tabNavigation.navigate).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true })
  })

  it("hides while the keyboard is up", async () => {
    const listeners = {}
    jest.spyOn(Keyboard, "addListener").mockImplementation((event, handler) => {
      listeners[event] = handler
      return { remove: jest.fn() }
    })
    await renderWithQuery(bar())
    await act(async () => (listeners.keyboardDidShow || listeners.keyboardWillShow)({ endCoordinates: { height: 300 } }))
    expect(screen.queryByLabelText("HOME")).toBeNull()
  })
})

describe("the app-wide modals", () => {
  it("each opens from the modal store", async () => {
    await renderWithQuery(<ModalManager />)
    await act(async () => useModalStore.getState().openModal("taskerIntro"))
    expect(screen.getByText("WHAT IT TAKES TO BE A TASKER")).toBeTruthy()
    await press("CONTINUE")
    expect(useModalStore.getState().modals.taskerIntro.open).toBe(false)
  })

  it("the alert shows, and its OK closes it", async () => {
    await renderWithQuery(<ModalManager />)
    await act(async () => useModalStore.getState().setMainAlert({ open: true, type: "error", title: "Oops", text: "It failed.", okText: "OK" }))
    expect(screen.getAllByText("It failed.").length).toBeGreaterThan(0)
    await press("OK")
    expect(alert().open).toBe(false)
  })

  it("forgot password opens from the login", async () => {
    useUiStore.setState({ authOpen: true })
    await renderWithQuery(<ModalManager />)
    await press("Forgot your password?")
    expect(useModalStore.getState().modals.forgotPassword.open).toBe(true)
    expect(screen.getByText("RESET PASSWORD")).toBeTruthy()
  })

  it("the confirm-complete modal shows the task", async () => {
    await renderWithQuery(<ModalManager />)
    await act(async () => useModalStore.getState().openModal("confirmComplete", { taskName: "Fix the tap", acceptedTime: null }))
    expect(screen.getByText("Fix the tap")).toBeTruthy()
  })
})

describe("the session", () => {
  it("the very first start welcomes the user once the intro is over; OK with the terms remembers it", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null)
    await renderWithQuery(<AppSession hideSplash statusPlaying={false} />)
    await act(async () => {})
    // (the tests run without translations: the title is its key) the introduction has no words yet, so no key shows
    expect(screen.getByText("Dobrodošli u Gotovo.")).toBeTruthy()
    expect(screen.queryByText("Intro tekst")).toBeNull()
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    await press("OK")
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("firstLoadCheck", "true")
  })

  it("not while the intro plays, nor after the first start", async () => {
    await renderWithQuery(<AppSession hideSplash statusPlaying />)
    expect(screen.queryByText("Dobrodošli u Gotovo.")).toBeNull()
    AsyncStorage.getItem.mockResolvedValueOnce("true")
    await renderWithQuery(<AppSession hideSplash statusPlaying={false} />)
    await act(async () => {})
    expect(screen.queryByText("Dobrodošli u Gotovo.")).toBeNull()
  })
})

describe("the app shell", () => {
  it("starts the app-wide work and listens on the user's channel", async () => {
    jest.useFakeTimers()
    try {
      await renderWithQuery(<Main />)
      expect(mockMain.appData).toHaveBeenCalled()
      expect(mockMain.connection).toHaveBeenCalled()
      expect(mockMain.liveChannels).toHaveBeenCalledWith("abc", expect.objectContaining({ onOpenModal: mockMain.routeLiveModal }))
      // the push permission is asked once the intro is over (at the latest after 5 s)
      expect(mockMain.register).not.toHaveBeenCalled()
      await act(async () => jest.advanceTimersByTime(5000))
      expect(mockMain.register).toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })

  it("a push tapped at a cold start waits for the navigator, then opens", async () => {
    const Notifications = require("expo-notifications")
    useUiStore.setState({ navigationReady: false })
    useAuthStore.setState({ restoring: false })
    mockLastResponse.current = { notification: { request: { content: { data: { data: { type: "new-task-question" } } } } } }
    await renderWithQuery(<Main />)
    expect(mockMain.routeNotification).not.toHaveBeenCalled()
    expect(Notifications.clearLastNotificationResponse).not.toHaveBeenCalled()
    await act(async () => useUiStore.setState({ navigationReady: true }))
    expect(mockMain.routeNotification).toHaveBeenCalledWith({ type: "new-task-question" })
    mockLastResponse.current = null
  })

  it("a push tapped at a cold start waits for the session to be restored (the user's role), then opens", async () => {
    useUiStore.setState({ navigationReady: true })
    useAuthStore.setState({ restoring: true })
    mockLastResponse.current = { notification: { request: { content: { data: { data: { type: "new-task-question" } } } } } }
    await renderWithQuery(<Main />)
    expect(mockMain.routeNotification).not.toHaveBeenCalled()
    await act(async () => useAuthStore.setState({ restoring: false }))
    expect(mockMain.routeNotification).toHaveBeenCalledWith({ type: "new-task-question" })
    mockLastResponse.current = null
  })

  it("a tapped push opens what it is about, once", async () => {
    const Notifications = require("expo-notifications")
    useUiStore.setState({ navigationReady: true })
    useAuthStore.setState({ restoring: false })
    mockLastResponse.current = { notification: { request: { content: { data: { data: { type: "new-task-offer", taskOfferId: 30 } } } } } }
    await renderWithQuery(<Main />)
    expect(mockMain.routeNotification).toHaveBeenCalledWith({ type: "new-task-offer", taskOfferId: 30 })
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalled()
    mockLastResponse.current = null
  })

  it("an app older than the API serves can only be updated; a current one goes on", async () => {
    Constants.expoConfig.version = "0.1.7"
    const outdated = makeQueryClient()
    outdated.setQueryData(["appSettings"], { buttons: [], services: [], settings: {}, minAppVersion: "99.0.0" })
    await renderWithQuery(<Main />, outdated)
    expect(screen.getByText("UPDATE THE APP")).toBeTruthy()
    // the app-wide modals are not there to cover it
    await act(async () => useModalStore.getState().setMainAlert({ open: true, type: "error", title: "Oops", text: "It failed.", okText: "OK" }))
    expect(screen.queryByText("It failed.")).toBeNull()

    const current = makeQueryClient()
    current.setQueryData(["appSettings"], { buttons: [], services: [], settings: {}, minAppVersion: null })
    await renderWithQuery(<Main />, current)
    expect(screen.queryByText("UPDATE THE APP")).toBeNull()
    delete Constants.expoConfig.version
  })

  it("logged out, no channel and no cached data", async () => {
    as("CLIENT", { loggedIn: false })
    const queryClient = makeQueryClient()
    queryClient.setQueryData(["myTasks"], ["old"])
    await renderWithQuery(<Main />, queryClient)
    expect(mockMain.liveChannels).toHaveBeenCalledWith(null, expect.anything())
    expect(queryClient.getQueryData(["myTasks"])).toBeUndefined()
  })
})
