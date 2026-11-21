import { act, waitFor } from "@testing-library/react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"

import useNotificationRouter from "../main/useNotificationRouter"
import useLanguageSetup, { chooseLanguage } from "../main/useLanguageSetup"
import useRoleSync from "../main/useRoleSync"
import useSessionStart from "../main/useSessionStart"
import usePushRegistration from "../main/usePushRegistration"
import useConnectionAlert from "../main/useConnectionAlert"
import { showTaskerIntroOnce } from "../main/taskerIntro"
import useSessionRestore from "../auth/useSessionRestore"
import useRegisterAction from "../auth/useRegisterAction"
import useAppleLogin from "../auth/useAppleLogin"
import useAppSettings from "../queries/useAppSettings"
import useAuthStore, { LOGGED_OUT_USER } from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import { renderHookWithQuery } from "../../testUtils/render"
import { getTaskById, getTaskInfoByTimeId } from "../../Services/TasksAPI"
import { updateLanguage, updateUserType, updateExpoPushToken } from "../../Services/UsersAPI"
import { user as userApi, register, loginApple } from "../../Services/API"
import { registerForPushNotifications } from "../../Services/pushNotifications"
import { appleAvailable, appleCredential } from "../../Services/socialSignIn"
import { getSettings } from "../../Services/settingsAPI"
import { getToken, clearToken } from "../../Services/authToken"
import { setResponseErrorHandler } from "../../Services/client"
import { refused } from "../../testUtils/api"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }), createNavigationContainerRef: () => ({ isReady: () => false }) }))
jest.mock("../../Services/TasksAPI", () => ({ getTaskById: jest.fn(), getTaskInfoByTimeId: jest.fn() }))
jest.mock("../../Services/UsersAPI", () => ({ updateLanguage: jest.fn(), updateUserType: jest.fn(), updateExpoPushToken: jest.fn() }))
jest.mock("../../Services/API", () => ({ user: jest.fn(), register: jest.fn(), login: jest.fn(), loginGoogle: jest.fn(), loginFacebook: jest.fn(), loginApple: jest.fn() }))
jest.mock("../../Services/pushNotifications", () => ({ registerForPushNotifications: jest.fn(), onPushTokenChange: jest.fn(() => () => {}) }))
jest.mock("../../Services/socialSignIn", () => ({ appleAvailable: jest.fn(), appleCredential: jest.fn() }))
jest.mock("../../Services/settingsAPI", () => ({ getSettings: jest.fn() }))
jest.mock("../../Services/authToken", () => ({ getToken: jest.fn(), setToken: jest.fn(), clearToken: jest.fn() }))
jest.mock("../../Services/client", () => ({ setResponseErrorHandler: jest.fn() }))
jest.mock("@react-native-community/netinfo", () => ({ addEventListener: jest.fn(() => () => {}) }))

const alert = () => useModalStore.getState().mainAlert
const modals = () => useModalStore.getState().modals
const initialModals = useModalStore.getState()
const client = { id: 6, type: "CLIENT", channel: "ch6" }

beforeEach(async () => {
  jest.clearAllMocks()
  await AsyncStorage.clear()
  useAuthStore.setState({ user: { loggedIn: true, userData: client }, userSelect: "CLIENT" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false }, modals: {} })
  useUiStore.setState({ spinners: 0, language: "EN", authOpen: false, registerOpen: false })
  appleAvailable.mockResolvedValue(false)
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("routing a tapped notification", () => {
  const router = () => renderHookWithQuery(() => useNotificationRouter())

  it("switches to the role the notification is for and opens what it leads to", async () => {
    const { result } = await router()
    await act(async () => result.current.routeNotification({ type: "new-task-offer", user_type: 1 }))
    expect(useAuthStore.getState().userSelect).toBe("TASKER")
    expect(mockNavigate).toHaveBeenCalledWith("Notifications", { viewOffers: true })
  })

  it("an unknown type or no data does nothing", async () => {
    const { result } = await router()
    await act(async () => {
      result.current.routeNotification(null)
      result.current.routeNotification({ type: "something-new" })
      result.current.routeLiveModal({ type: "something-new" })
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("a started task asks the client only while it still waits for the answer", async () => {
    getTaskById.mockResolvedValueOnce({ status: 8 }).mockResolvedValueOnce({ status: 9 })
    const { result, client: queryClient } = await router()
    await act(async () => result.current.routeNotification({ type: "tasker-start-task", taskId: 9 }))
    expect(modals().startedTask).toMatchObject({ open: true, data: { taskId: 9 } })

    useModalStore.setState({ modals: {} })
    queryClient.clear()
    await act(async () => result.current.routeLiveModal({ type: "tasker-start-task", data: { data: { taskId: 9 } } }))
    expect(modals().startedTask).toBeUndefined()
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("a revised offer shows whether the client already answered it, also when the task can't be loaded", async () => {
    const offer = { task: { id: 9 }, editedOffer: { id: 31 } }
    getTaskById.mockResolvedValueOnce({ offers: [{ id: 31, status: 1 }] })
    const { result, client: queryClient } = await router()
    await act(async () => result.current.routeNotification({ type: "edit-task-offer", task: offer }))
    expect(modals().offerSent.data).toMatchObject({ taskOfferStatusEdited: true })

    queryClient.clear()
    getTaskById.mockRejectedValueOnce(new Error("offline"))
    await act(async () => result.current.routeNotification({ type: "edit-task-offer", task: offer }))
    expect(modals().offerSent.data).toMatchObject({ taskOfferStatusEdited: false })
  })

  it("an accepted time shows the client the task with that time", async () => {
    getTaskInfoByTimeId.mockResolvedValue({
      task: {
        times: [
          { id: 1, status: 0 },
          { id: 2, status: 1 }
        ]
      }
    })
    const { result } = await router()
    await act(async () => result.current.routeNotification({ type: "task-time-accepted", timeId: 2 }))
    expect(getTaskInfoByTimeId).toHaveBeenCalledWith(2)
    expect(modals().timeAccepted.data.confirmedDate).toEqual({ id: 2, status: 1 })
  })

  it("a task not started is explained and its button goes to My Tasks", async () => {
    const { result } = await router()
    await act(async () => result.current.routeNotification({ type: "task-not-started", task: { taskName: "Ormar" } }))
    expect(alert()).toMatchObject({ open: true, title: "TASK START NOT CONFIRMED" })
    await act(async () => alert().proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { refresh: true })
    expect(alert().open).toBe(false)
  })
})

describe("the app's language", () => {
  it("Serbian the first time (whatever the device's language), saved on the server while logged in", async () => {
    updateLanguage.mockResolvedValue(undefined)
    useUiStore.setState({ language: null })
    await renderHookWithQuery(() => useLanguageSetup())
    await waitFor(() => expect(useUiStore.getState().language).toBe("SR"))
    expect(await AsyncStorage.getItem("@language")).toBe("SR")
    await waitFor(() => expect(updateLanguage).toHaveBeenCalledWith("SR"))
  })

  it("a chosen language is stored and becomes the app's (the screens draw again with it)", async () => {
    await chooseLanguage("EN")
    expect(useUiStore.getState().language).toBe("EN")
    expect(await AsyncStorage.getItem("@language")).toBe("EN")
  })
})

describe("the role", () => {
  it("follows the server's role", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { ...client, type: "TASKER" } }, userSelect: "CLIENT" })
    await renderHookWithQuery(() => useRoleSync(jest.fn()))
    expect(useAuthStore.getState().userSelect).toBe("TASKER")
    expect(updateUserType).not.toHaveBeenCalled()
  })

  it("a role changed in the app is saved, then the user reloads; where the app goes is not the hook's", async () => {
    updateUserType.mockResolvedValue(undefined)
    const reloadUser = jest.fn()
    const { rerender } = await renderHookWithQuery(() => useRoleSync(reloadUser))
    await act(async () => useAuthStore.setState({ userSelect: "TASKER" }))
    await rerender()
    await waitFor(() => expect(updateUserType).toHaveBeenCalledWith(1))
    // (a notification for the other role keeps the screen it opened)
    expect(mockNavigate).not.toHaveBeenCalledWith("Home")
    await waitFor(() => expect(reloadUser).toHaveBeenCalledWith(true))
  })
})

describe("restoring the session", () => {
  it("logs the user back in from the stored token", async () => {
    getToken.mockResolvedValue("tok")
    userApi.mockResolvedValue({ ...client, type: "TASKER" })
    useAuthStore.setState({ user: LOGGED_OUT_USER })
    const onTasker = jest.fn()
    const { result } = await renderHookWithQuery(() => useSessionRestore({ onTasker }))
    let restored
    await act(async () => (restored = await result.current({ refreshCount: true })))
    expect(restored.id).toBe(6)
    expect(useAuthStore.getState().user.loggedIn).toBe(true)
    expect(onTasker).toHaveBeenCalled()
  })

  it("without a token there is nothing to restore", async () => {
    getToken.mockResolvedValue(null)
    const { result } = await renderHookWithQuery(() => useSessionRestore())
    await expect(result.current()).resolves.toBe(null)
    expect(userApi).not.toHaveBeenCalled()
  })

  it("offline the token stays; a refused session ends it", async () => {
    getToken.mockResolvedValue("tok")
    userApi.mockRejectedValueOnce(new Error("Network Error"))
    const { result } = await renderHookWithQuery(() => useSessionRestore())
    await act(async () => result.current())
    expect(clearToken).not.toHaveBeenCalled()

    // a token the server no longer takes ends the session
    userApi.mockRejectedValueOnce(refused(401, "unauthenticated", "Unauthorized."))
    await act(async () => result.current())
    expect(clearToken).toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Session ended", text: "Please log in again." })
  })

  it("at start, any answer that the account is disabled logs out with an alert; every failure goes on", async () => {
    getToken.mockResolvedValue(null)
    useAuthStore.setState({ user: LOGGED_OUT_USER })
    await renderHookWithQuery(() => useSessionStart())
    const handler = setResponseErrorHandler.mock.calls[0][0]
    const disabled = { response: { status: 401, data: { error: { code: "account_disabled", message: "Your account has been disabled." } } } }
    await act(async () => expect(() => handler(disabled)).toThrow())
    expect(clearToken).toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "ACCOUNT DISABLED", text: "Your account has been disabled." })
    // a deleted account: its own title (same code: the apps of before sign out too)
    useModalStore.setState({ mainAlert: { open: false } })
    const deleted = { response: { status: 401, data: { error: { code: "account_disabled", reason: "deleted", message: "Your account has been deleted." } } } }
    await act(async () => expect(() => handler(deleted)).toThrow())
    expect(alert()).toMatchObject({ open: true, title: "ACCOUNT IS DELETED", text: "Your account has been deleted." })
    expect(() => handler({ response: { status: 401, data: { error: { code: "unauthenticated", message: "Unauthorized." } } } })).toThrow()
    expect(() => handler({ response: { status: 500 } })).toThrow()
  })

  it("a token the server no longer takes, on a signed-in request: signed out once, with one notice", async () => {
    getToken.mockResolvedValue("tok")
    useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6 } } })
    await renderHookWithQuery(() => useSessionStart())
    const handler = setResponseErrorHandler.mock.calls[0][0]
    const expired = { config: { headers: { Authorization: "Bearer tok" } }, response: { status: 401, data: { error: { code: "unauthenticated", message: "Unauthorized." } } } }
    await act(async () => expect(() => handler(expired)).toThrow())
    expect(clearToken).toHaveBeenCalledTimes(1)
    expect(alert()).toMatchObject({ open: true, title: "Session ended" })
    // the other requests failing the same way: already signed out
    await act(async () => expect(() => handler(expired)).toThrow())
    expect(clearToken).toHaveBeenCalledTimes(1)
  })

  it("a login refused (no token sent) is not a session ending", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6 } } })
    await renderHookWithQuery(() => useSessionStart())
    const handler = setResponseErrorHandler.mock.calls[0][0]
    await act(async () => expect(() => handler({ config: { headers: {} }, response: { status: 401, data: { error: { code: "unauthenticated" } } } })).toThrow())
    expect(clearToken).not.toHaveBeenCalled()
  })

  it("restoring lasts until the stored session is restored or found missing", async () => {
    getToken.mockResolvedValue(null)
    useAuthStore.setState({ user: LOGGED_OUT_USER, restoring: true })
    await renderHookWithQuery(() => useSessionStart())
    await waitFor(() => expect(useAuthStore.getState().restoring).toBe(false))
  })
})

describe("registering", () => {
  const data = { email: "ana@example.rs", password: "12345678" }

  it("closes the modals while it runs and sends the new user to log in", async () => {
    register.mockResolvedValue({ message: "Check your mail" })
    const onRegistered = jest.fn()
    useUiStore.setState({ registerOpen: true })
    const { result } = await renderHookWithQuery(() => useRegisterAction({ onRegistered }))
    await act(async () => result.current.doRegisterRequest(data))
    expect(useUiStore.getState().registerOpen).toBe(false)
    expect(onRegistered).toHaveBeenCalled()
    await act(async () => alert().proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("Home", { registerSuccess: "ana@example.rs" })
  })

  it("an e-mail already registered is an error, not a success: its OK opens the login, the form stays", async () => {
    register.mockResolvedValue({ status: "already_registered", message: "User already registered. Please login." })
    const onRegistered = jest.fn()
    const { result } = await renderHookWithQuery(() => useRegisterAction({ onRegistered }))
    await act(async () => result.current.doRegisterRequest(data))
    expect(alert()).toMatchObject({ open: true, type: "error", title: "ERROR", text: "E-mail address is already registered. Please login." })
    expect(onRegistered).not.toHaveBeenCalled()
    await act(async () => alert().proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("Home", { registerSuccess: "ana@example.rs" })
  })

  it("a taken email is explained and the form comes back", async () => {
    register.mockRejectedValue(refused(422, "invalid", "The given data was invalid.", { email: ["validation.unique"], full_name: ["required"] }))
    const { result } = await renderHookWithQuery(() => useRegisterAction())
    await act(async () => result.current.doRegisterRequest(data))
    expect(alert().text).toContain("Email is already taken")
    expect(alert().text).toContain("Full_name field is required.")
    await act(async () => alert().proceedAction())
    expect(useUiStore.getState().registerOpen).toBe(true)
  })

  it("a refusal shows the server's error", async () => {
    register.mockRejectedValue(refused(422, "refused", "Registrations are closed"))
    const { result } = await renderHookWithQuery(() => useRegisterAction())
    await act(async () => result.current.doRegisterRequest(data))
    expect(alert()).toMatchObject({ title: "Register error", text: "Registrations are closed" })
  })
})

describe("Apple login", () => {
  it("logs in with the device's credential; without a name asks for it and sends it again", async () => {
    useAuthStore.setState({ user: LOGGED_OUT_USER })
    appleAvailable.mockResolvedValue(true)
    appleCredential.mockResolvedValue({ identityToken: "a" })
    loginApple.mockRejectedValueOnce(refused(422, "name_needed", "No name provided.")).mockResolvedValueOnce({ access_token: "t", user: client })
    const beforeLogin = jest.fn()
    const { result } = await renderHookWithQuery(() => useAppleLogin({ beforeLogin, failedText: "Apple failed" }))
    await waitFor(() => expect(result.current.available).toBe(true))

    await act(async () => result.current.start())
    await waitFor(() => expect(result.current.nameModal.open).toBe(true))
    expect(beforeLogin).toHaveBeenCalled()

    await act(async () => result.current.nameModal.submit("", ""))
    expect(alert().text).toContain("Please enter valid name")

    await act(async () => result.current.nameModal.submit("Ana", "Anić"))
    await waitFor(() => expect(loginApple).toHaveBeenLastCalledWith({ identityToken: "a" }, "CLIENT", "Ana", "Anić", "EN"))
  })

  it("a failed device sign-in shows the given text", async () => {
    appleCredential.mockRejectedValue(new Error("cancelled"))
    const { result } = await renderHookWithQuery(() => useAppleLogin({ failedText: "Apple failed" }))
    await act(async () => result.current.start())
    expect(alert()).toMatchObject({ title: "Login Error", text: "Apple failed" })
  })
})

describe("device services at start", () => {
  it("registers for push once and gives the token to the server while logged in", async () => {
    registerForPushNotifications.mockResolvedValue("ExponentPushToken[x]")
    updateExpoPushToken.mockResolvedValue(undefined)
    const { result } = await renderHookWithQuery(() => usePushRegistration())
    await act(async () => {
      result.current.register()
      result.current.register()
    })
    await waitFor(() => expect(updateExpoPushToken).toHaveBeenCalledWith("ExponentPushToken[x]"))
    expect(registerForPushNotifications).toHaveBeenCalledTimes(1)
  })

  it("offline shows an alert that closes when the connection is back", async () => {
    await renderHookWithQuery(() => useConnectionAlert())
    const listener = NetInfo.addEventListener.mock.calls[0][0]
    await act(async () => listener({ isConnected: false }))
    expect(alert()).toMatchObject({ open: true, title: "Connection problem" })
    await act(async () => listener({ isConnected: true }))
    expect(alert().open).toBe(false)
  })

  it("the tasker introduction shows only the first time", async () => {
    await showTaskerIntroOnce()
    expect(modals().taskerIntro.open).toBe(true)
    useModalStore.setState({ modals: {} })
    await showTaskerIntroOnce()
    expect(modals().taskerIntro).toBeUndefined()
  })

  it("the app settings load once; a failed load is an error", async () => {
    getSettings.mockRejectedValueOnce(new Error("Network Error"))
    const failed = await renderHookWithQuery(() => useAppSettings())
    expect(failed.result.current.services).toEqual([])
  })
})
