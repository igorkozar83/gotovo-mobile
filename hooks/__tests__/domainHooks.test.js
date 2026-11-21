import { act } from "@testing-library/react-native"

import { useAddressLookup } from "../address/useAddressLookup"
import { useServerLogout, googleToken } from "../auth/useAccountActions"
import { useReadQuestion } from "../questions/useReadQuestion"
import { useUploadDocument } from "../profile/useProfileUploads"
import useTaskCalendarReminder from "../myTasks/useTaskCalendarReminder"
import useModalStore from "../../stores/modalStore"
import { renderHookWithQuery } from "../../testUtils/render"
import { getAddress, uploadUserImage } from "../../Services/UsersAPI"
import { logout } from "../../Services/API"
import { clientReadQuestion } from "../../Services/TasksAPI"
import { addCalendarEvent } from "../../Services/deviceCalendar"
import { googleAccessToken } from "../../Services/socialSignIn"

jest.mock("../../Services/UsersAPI", () => ({ getAddress: jest.fn(), uploadUserImage: jest.fn(), uploadImage: jest.fn() }))
jest.mock("../../Services/API", () => ({ logout: jest.fn(), requestResetPassword: jest.fn(), sendVerifySms: jest.fn(), checkVerifySms: jest.fn() }))
jest.mock("../../Services/TasksAPI", () => ({ clientReadQuestion: jest.fn() }))
jest.mock("../../Services/deviceCalendar", () => ({ addCalendarEvent: jest.fn() }))
jest.mock("../../Services/socialSignIn", () => ({ googleAccessToken: jest.fn(), GOOGLE_LOGIN: "login" }))

const alert = () => useModalStore.getState().mainAlert
const runOf = async (result, ...args) => act(async () => result.current.run(...args))

beforeEach(() => {
  jest.clearAllMocks()
  useModalStore.setState({ mainAlert: { open: false } })
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("useAddressLookup", () => {
  it("hands over the address at the point, then is done", async () => {
    getAddress.mockResolvedValue({ street: "Maleska 14", city: "Beograd", zip: "11000" })
    const onFound = jest.fn()
    const onDone = jest.fn()
    const { result } = await renderHookWithQuery(() => useAddressLookup({ onFound, onDone }))
    await runOf(result, { latitude: 44.8, longitude: 20.4 })
    expect(onFound).toHaveBeenCalledWith({ street: "Maleska 14", city: "Beograd", zip: "11000", coords: { latitude: 44.8, longitude: 20.4 } })
    expect(onDone).toHaveBeenCalled()
  })

  it("is done also when the lookup fails", async () => {
    getAddress.mockRejectedValue(new Error("offline"))
    const onFound = jest.fn()
    const onDone = jest.fn()
    const { result } = await renderHookWithQuery(() => useAddressLookup({ onFound, onDone }))
    await runOf(result, { latitude: 1, longitude: 2 })
    expect(onFound).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalled()
  })
})

describe("useServerLogout", () => {
  it("logs out on the device whatever the server says", async () => {
    const onDone = jest.fn()
    logout.mockResolvedValue(undefined)
    const ok = await renderHookWithQuery(() => useServerLogout({ onDone }))
    await runOf(ok.result)
    logout.mockRejectedValue(new Error("offline"))
    const failed = await renderHookWithQuery(() => useServerLogout({ onDone }))
    await runOf(failed.result)
    expect(onDone).toHaveBeenCalledTimes(2)
  })
})

describe("useReadQuestion", () => {
  it("marks the question read without the spinner and reloads the inbox count", async () => {
    clientReadQuestion.mockResolvedValue(undefined)
    const onSuccess = jest.fn()
    const { result, client } = await renderHookWithQuery(() => useReadQuestion({ onSuccess }))
    const invalidate = jest.spyOn(client, "invalidateQueries")
    await runOf(result, 12)
    expect(clientReadQuestion).toHaveBeenCalledWith(12)
    expect(onSuccess).toHaveBeenCalled()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["inboxCount"] })
  })
})

describe("useUploadDocument", () => {
  it("tells the user the document will be checked", async () => {
    uploadUserImage.mockResolvedValue(undefined)
    const onSuccess = jest.fn()
    const { result } = await renderHookWithQuery(() => useUploadDocument({ onSuccess }))
    await runOf(result, { uri: "file://doc.jpg" })
    expect(onSuccess).toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "success", title: "DOCUMENT UPLOAD" })
  })
})

describe("useTaskCalendarReminder", () => {
  it("says so when there is no confirmed time", async () => {
    const { result } = await renderHookWithQuery(() => useTaskCalendarReminder())
    let saved
    await act(async () => {
      saved = await result.current("Paint", null)
    })
    expect(saved).toBe(false)
    expect(addCalendarEvent).not.toHaveBeenCalled()
    expect(alert().text).toBe("Confirmed date is not set.")
  })

  it("explains a refused calendar permission", async () => {
    addCalendarEvent.mockResolvedValue(null)
    const { result } = await renderHookWithQuery(() => useTaskCalendarReminder())
    let saved
    await act(async () => {
      saved = await result.current("Paint", { date: "2026-10-08", start: "10:00:00", end: "12:00:00" })
    })
    expect(saved).toBe(false)
    expect(alert().text).toContain("calendar granted permission")
  })

  it("saves the event with the task's name", async () => {
    addCalendarEvent.mockResolvedValue("event-1")
    const { result } = await renderHookWithQuery(() => useTaskCalendarReminder())
    let saved
    await act(async () => {
      saved = await result.current("Paint", { date: "2026-10-08", start: "10:00:00", end: "12:00:00" })
    })
    expect(saved).toBe(true)
    expect(addCalendarEvent.mock.calls[0][0].title).toContain("Paint")
  })
})

describe("the Google token", () => {
  it("logging in and registering ask Google with the same config", async () => {
    // registering had its own config (the Android id as the web client id): Google refused it on a phone
    googleAccessToken.mockResolvedValue("g-token")
    await expect(googleToken()).resolves.toBe("g-token")
    expect(googleAccessToken).toHaveBeenCalledWith("login")
  })
})
