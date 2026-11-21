import { act, waitFor } from "@testing-library/react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import useLoginActions from "../auth/useLoginActions"
import useSession from "../auth/useSession"
import useAuthStore, { LOGGED_OUT_USER } from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import useModalStore from "../../stores/modalStore"
import { renderHookWithQuery } from "../../testUtils/render"
import { login, loginApple, loginGoogle } from "../../Services/API"
import { requestEmailVerification } from "../../Services/UsersAPI"
import { setToken, clearToken } from "../../Services/authToken"
import { refused } from "../../testUtils/api"
import { resetToHome } from "../../RootNavigation"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../RootNavigation", () => ({ resetToHome: jest.fn() }))
jest.mock("../../Services/API", () => ({ login: jest.fn(), loginGoogle: jest.fn(), loginFacebook: jest.fn(), loginApple: jest.fn() }))
jest.mock("../../Services/UsersAPI", () => ({ requestEmailVerification: jest.fn() }))
jest.mock("../../Services/authToken", () => ({ setToken: jest.fn(), clearToken: jest.fn() }))

const verifiedUser = { id: 6, type: "CLIENT", phone_verified: 1, email_verified_at: "2026-01-01" }
const alert = () => useModalStore.getState().mainAlert
const flush = () => act(async () => {})
const initialModals = useModalStore.getState()

beforeEach(() => {
  jest.clearAllMocks()
  // (the phone's storage, e.g. a kept task draft, starts empty)
  AsyncStorage.clear()
  jest.useRealTimers()
  useAuthStore.setState({ user: LOGGED_OUT_USER, userSelect: "CLIENT" })
  useUiStore.setState({ authOpen: true, spinners: 0, language: "sr" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false }, modals: {} })
})

describe("email login", () => {
  it("stores the token, logs the user in and closes the login modal", async () => {
    login.mockResolvedValue({ access_token: "tok", user: verifiedUser })
    const onLoggedIn = jest.fn()
    const { result } = await renderHookWithQuery(() => useLoginActions({ onLoggedIn }))
    await act(async () => result.current.doLogin("a@b.rs", "12345678"))

    expect(login).toHaveBeenCalledWith("a@b.rs", "12345678")
    expect(setToken).toHaveBeenCalledWith("tok")
    expect(useAuthStore.getState().user).toEqual({ loggedIn: true, userData: verifiedUser })
    expect(useUiStore.getState().authOpen).toBe(false)
    expect(useUiStore.getState().spinners).toBe(0)
    expect(onLoggedIn).toHaveBeenCalled()
    expect(alert().open).toBe(false)
  })

  it("offers to verify an unverified phone", async () => {
    login.mockResolvedValue({ access_token: "tok", user: { ...verifiedUser, phone_verified: 0 } })
    const onPhoneVerify = jest.fn()
    const { result } = await renderHookWithQuery(() => useLoginActions({ onPhoneVerify }))
    await act(async () => result.current.doLogin("a@b.rs", "12345678"))

    expect(alert()).toMatchObject({ open: true, title: "VERIFY PHONE", text: "Please verify your phone number in order to complete your profile." })
    await act(async () => alert().proceedAction())
    expect(onPhoneVerify).toHaveBeenCalled()
    expect(alert().open).toBe(false)
  })

  it("offers to send the verification mail for an unverified email", async () => {
    login.mockResolvedValue({ access_token: "tok", user: { ...verifiedUser, email_verified_at: null } })
    requestEmailVerification.mockResolvedValue(undefined)
    const { result } = await renderHookWithQuery(() => useLoginActions())
    await act(async () => result.current.doLogin("a@b.rs", "12345678"))

    expect(alert()).toMatchObject({ open: true, title: "Verify email" })
    await act(async () => alert().proceedAction())
    await flush()
    expect(requestEmailVerification).toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "success", title: "Email verification", text: expect.stringContaining("Email verification sent successfully!") })
  })

  it("a wrong password shows the server's error and its OK brings the login modal back", async () => {
    login.mockRejectedValue(refused(422, "wrong_credentials", "Wrong email or password"))
    const { result } = await renderHookWithQuery(() => useLoginActions())
    await act(async () => result.current.doLogin("a@b.rs", "bad"))

    expect(setToken).not.toHaveBeenCalled()
    expect(useAuthStore.getState().user.loggedIn).toBe(false)
    expect(alert()).toMatchObject({ open: true, type: "error", title: "Login error", text: "Wrong email or password" })
    expect(useUiStore.getState().authOpen).toBe(false)
    await act(async () => alert().proceedAction())
    expect(useUiStore.getState().authOpen).toBe(true)
  })

  it("an unverified account is told to verify it", async () => {
    login.mockRejectedValue(refused(422, "email_not_verified", "Verify your email first"))
    const { result } = await renderHookWithQuery(() => useLoginActions())
    await act(async () => result.current.doLogin("a@b.rs", "12345678"))
    expect(alert()).toMatchObject({ open: true, title: "VERIFY ACCOUNT", text: "Verify your email first" })
  })

  it("a failed request shows an error and stops the spinner", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {})
    login.mockRejectedValue(new Error("Network Error"))
    const { result } = await renderHookWithQuery(() => useLoginActions())
    await act(async () => result.current.doLogin("a@b.rs", "12345678"))
    expect(alert()).toMatchObject({ open: true, type: "error" })
    expect(useUiStore.getState().spinners).toBe(0)
    expect(useAuthStore.getState().user.loggedIn).toBe(false)
  })
})

describe("social login", () => {
  it("Google signs up with the role and language the user has picked", async () => {
    useAuthStore.setState({ user: { ...LOGGED_OUT_USER, type: "TASKER" } })
    loginGoogle.mockResolvedValue({ access_token: "g", user: verifiedUser })
    const { result } = await renderHookWithQuery(() => useLoginActions())
    await act(async () => result.current.doLoginGoogle("google-token"))
    await flush()
    expect(loginGoogle).toHaveBeenCalledWith("google-token", "TASKER", "sr")
    expect(setToken).toHaveBeenCalledWith("g")
    expect(useAuthStore.getState().user.loggedIn).toBe(true)
  })

  it("Apple without a name asks for it", async () => {
    loginApple.mockRejectedValue(refused(422, "name_needed", "No name provided."))
    const onAppleNameNeeded = jest.fn()
    const { result } = await renderHookWithQuery(() => useLoginActions({ onAppleNameNeeded }))
    await act(async () => result.current.doLoginApple({ identityToken: "x" }))
    await flush()
    expect(onAppleNameNeeded).toHaveBeenCalled()
    expect(alert().open).toBe(false)
  })
})

describe("useSession", () => {
  it("a task the tasker started asks the client to confirm the start", async () => {
    jest.useFakeTimers()
    const { result } = await renderHookWithQuery(() => useSession())
    const task = { id: 9, status: 8, name: "Ormar", offer_task_check: { id: 3 }, accepted_time: [{ id: 1 }], posted_by_user: { id: 6 }, accepted_by_user: { id: 7 } }
    await act(async () => result.current.signIn("tok", { ...verifiedUser, tasks_check: [task] }))
    await act(async () => jest.advanceTimersByTime(1000))
    expect(useModalStore.getState().modals.startedTask).toMatchObject({ open: true, data: { type: "tasker-start-task", taskId: 9, taskName: "Ormar" } })
  })

  it("a revised offer is shown to answer", async () => {
    const requestOfferSent = jest.fn()
    useModalStore.setState({ requestOfferSent })
    const { result } = await renderHookWithQuery(() => useSession())
    const revised = { id: 4, edited_offers: [{ id: 2 }], accepted_offer: [{ id: 1 }], accepted_by_user: { id: 7 }, posted_by_user: { id: 6 } }
    await act(async () => result.current.signIn("tok", { ...verifiedUser, revised_active_offers: [revised] }))
    expect(requestOfferSent).toHaveBeenCalledWith({ open: true, data: expect.objectContaining({ task: revised, editedOffer: { id: 2 }, acceptedOffer: { id: 1 } }) })
  })

  it("a task kept while registering: going on with it opens the form with it", async () => {
    await AsyncStorage.setItem("taskDraft", JSON.stringify({ category: 2, values: { taskName: "Ormar" } }))
    const { result } = await renderHookWithQuery(() => useSession())
    await act(async () => result.current.signIn("tok", verifiedUser))
    await waitFor(() => expect(useModalStore.getState().mainAlert).toMatchObject({ open: true, title: "Your task is saved" }))
    await act(async () => useModalStore.getState().mainAlert.proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("PostTask", { draft: true })
  })

  it("without a kept task nothing is offered", async () => {
    const { result } = await renderHookWithQuery(() => useSession())
    await act(async () => result.current.signIn("tok", verifiedUser))
    expect(useModalStore.getState().mainAlert.open).toBeFalsy()
  })

  it("signing out on the device drops the token and shows Home, every tab at its root, as a client", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: verifiedUser }, userSelect: "TASKER" })
    const { result } = await renderHookWithQuery(() => useSession())
    await act(async () => result.current.signOutLocally())
    expect(clearToken).toHaveBeenCalled()
    expect(useAuthStore.getState().user).toEqual({ loggedIn: false, userData: { reviews: [] } })
    expect(useAuthStore.getState().userSelect).toBe("CLIENT")
    expect(resetToHome).toHaveBeenCalled()
  })
})
