import { Platform } from "react-native"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import * as Calendar from "expo-calendar"
import { GoogleSignin } from "@react-native-google-signin/google-signin"

import { registerForPushNotifications, onPushTokenChange, expoToken } from "../pushNotifications"
import { googleAccessToken, GOOGLE_LOGIN } from "../socialSignIn"
import { addCalendarEvent } from "../deviceCalendar"
import { saveKey, getKey, deleteKey } from "../../Helpers/secureStorage"
import { getToken, setToken, clearToken } from "../authToken"

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { MAX: 5 }
}))
let mockIsDevice = true
jest.mock("expo-device", () => ({
  get isDevice() {
    return mockIsDevice
  }
}))
jest.mock("expo-secure-store", () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn() }))
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { extra: { eas: { projectId: "proj-1" }, API_URL: "http://test.local/api/" } } } }))
jest.mock("expo-apple-authentication", () => ({ signInAsync: jest.fn(), isAvailableAsync: jest.fn(), AppleAuthenticationScope: {} }))
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: { configure: jest.fn(), hasPlayServices: jest.fn(), getCurrentUser: jest.fn(), revokeAccess: jest.fn(), signIn: jest.fn(), getTokens: jest.fn() }
}))
jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getDefaultCalendarAsync: jest.fn(),
  createCalendarAsync: jest.fn(),
  createEventAsync: jest.fn(),
  EntityTypes: { EVENT: "event" },
  CalendarAccessLevel: { OWNER: "owner" },
  AlarmMethod: { DEFAULT: "default" }
}))

// Expo's push API over XMLHttpRequest: each request answers with the next response
const sent = []
const expoAnswers = []
class FakeXhr {
  open(method, url) {
    this.url = url
  }
  setRequestHeader() {}
  send(body) {
    sent.push({ url: this.url, body: JSON.parse(body) })
    const answer = expoAnswers.shift()
    if (answer === "fail") this.onerror()
    else {
      this.response = answer
      this.onload()
    }
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  sent.length = 0
  expoAnswers.length = 0
  global.XMLHttpRequest = FakeXhr
  Platform.OS = "android"
  mockIsDevice = true
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("push notifications", () => {
  it("asks for the permission, then resolves to the Expo token of the project", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: "granted" })
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: "ExponentPushToken[x]" })
    await expect(registerForPushNotifications()).resolves.toBe("ExponentPushToken[x]")
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: "proj-1" })
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith("default", expect.objectContaining({ importance: 5 }))
  })

  it("asks for the permission once and gives up when it is refused", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: "undetermined" })
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: "denied" })
    await expect(registerForPushNotifications()).resolves.toBeUndefined()
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
  })

  it("a failure is tried again; one that stays is no token", async () => {
    Notifications.getExpoPushTokenAsync.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ data: "ExponentPushToken[y]" })
    await expect(expoToken(3, 1)).resolves.toBe("ExponentPushToken[y]")
    Notifications.getExpoPushTokenAsync.mockReset().mockRejectedValue(new Error("no FCM"))
    await expect(expoToken(3, 1)).resolves.toBeUndefined()
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(3)
  })

  it("an emulator gets no token, without a word to the user", async () => {
    mockIsDevice = false
    global.alert = jest.fn()
    await expect(registerForPushNotifications()).resolves.toBeUndefined()
    expect(global.alert).not.toHaveBeenCalled()
  })

  it("a replaced device token brings a new Expo token to the listener", async () => {
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: "ExponentPushToken[new]" })
    const handler = jest.fn()
    const stop = onPushTokenChange(handler)
    await Notifications.addPushTokenListener.mock.calls[0][0]({ type: "android", data: "fcm-2" })
    expect(handler).toHaveBeenCalledWith("ExponentPushToken[new]")
    stop()
  })

  it("asking for the Expo token, which makes the system tell the same device token again, asks no more", async () => {
    const handler = jest.fn()
    const stop = onPushTokenChange(handler)
    const listener = Notifications.addPushTokenListener.mock.calls.pop()[0]
    // (as on a device: the Expo token's request fires the listener with the device token it got)
    Notifications.getExpoPushTokenAsync.mockImplementation(async () => {
      await listener({ type: "android", data: "fcm-3" })
      return { data: "ExponentPushToken[same]" }
    })
    await listener({ type: "android", data: "fcm-3" })
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledTimes(1)
    stop()
  })
})

describe("Google sign-in", () => {
  it("resolves to the access token, signing out a previous Google user first", async () => {
    GoogleSignin.getCurrentUser.mockReturnValue({ user: {} })
    GoogleSignin.getTokens.mockResolvedValue({ accessToken: "g-token" })
    await expect(googleAccessToken(GOOGLE_LOGIN)).resolves.toBe("g-token")
    expect(GoogleSignin.configure).toHaveBeenCalledWith(GOOGLE_LOGIN)
    expect(GoogleSignin.revokeAccess).toHaveBeenCalled()
  })

  it("a cancelled sign-in gives null", async () => {
    GoogleSignin.signIn.mockRejectedValue(new Error("cancelled"))
    await expect(googleAccessToken(GOOGLE_LOGIN)).resolves.toBe(null)
  })
})

describe("device calendar", () => {
  const event = { title: "Ormar", notes: "Beograd", startDate: new Date(1), endDate: new Date(2) }

  it("adds the event to the app's calendar with a reminder 10 minutes before", async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" })
    Calendar.getCalendarsAsync.mockResolvedValue([{ id: "c1", title: "Expo Calendar", allowsModifications: true }])
    await expect(addCalendarEvent(event)).resolves.toBe(true)
    expect(Calendar.createCalendarAsync).not.toHaveBeenCalled()
    expect(Calendar.createEventAsync).toHaveBeenCalledWith("c1", { ...event, alarms: [{ relativeOffset: -10, method: "default" }] })
  })

  it("creates the app's calendar the first time", async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" })
    Calendar.getCalendarsAsync.mockResolvedValue([])
    Calendar.createCalendarAsync.mockResolvedValue("c2")
    await addCalendarEvent(event)
    expect(Calendar.createCalendarAsync).toHaveBeenCalledWith(expect.objectContaining({ title: "Expo Calendar", source: { isLocalAccount: true, name: "Expo Calendar" } }))
    expect(Calendar.createEventAsync.mock.calls[0][0]).toBe("c2")
  })

  it("without the permission nothing is added", async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "denied" })
    await expect(addCalendarEvent(event)).resolves.toBe(false)
    expect(Calendar.createEventAsync).not.toHaveBeenCalled()
  })
})

describe("secure storage and the login token", () => {
  it("failures are swallowed", async () => {
    SecureStore.setItemAsync.mockRejectedValue(new Error("locked"))
    SecureStore.getItemAsync.mockRejectedValue(new Error("locked"))
    SecureStore.deleteItemAsync.mockRejectedValue(new Error("locked"))
    await expect(saveKey("k", "v")).resolves.toBeUndefined()
    await expect(getKey("k")).resolves.toBeUndefined()
    await expect(deleteKey("k")).resolves.toBeUndefined()
  })

  it("the token is read from storage once and then kept in memory", async () => {
    SecureStore.getItemAsync.mockResolvedValue("stored")
    await clearToken()
    await setToken("fresh")
    await expect(getToken()).resolves.toBe("fresh")
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("hotovoToken", "fresh")
    await clearToken()
    await expect(getToken()).resolves.toBe(null)
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("hotovoToken")
  })
})
