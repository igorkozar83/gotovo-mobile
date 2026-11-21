// The query cache follows the app and the connection: the app back in the front counts as focus (the
// queries on screen reload), a lost connection as offline (queries wait, then reload).
import { AppState } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { focusManager, onlineManager } from "@tanstack/react-query"

let appStateListener
let netListener
jest.spyOn(AppState, "addEventListener").mockImplementation((event, listener) => {
  appStateListener = listener
  return { remove: jest.fn() }
})
jest.spyOn(NetInfo, "addEventListener").mockImplementation((listener) => {
  netListener = listener
  return jest.fn()
})

const { queryClient } = require("../queryClient")

it("reloads the queries on screen when the app comes back and when the connection does", () => {
  expect(queryClient.getDefaultOptions().queries).toMatchObject({ refetchOnWindowFocus: true, refetchOnReconnect: true })
  // (an action offline still goes, and fails at once)
  expect(queryClient.getDefaultOptions().mutations).toMatchObject({ networkMode: "always" })
})

it("the app in the background is not focused; back in the front it is", () => {
  appStateListener("background")
  expect(focusManager.isFocused()).toBe(false)
  appStateListener("active")
  expect(focusManager.isFocused()).toBe(true)
})

it("no connection is offline; back, online", () => {
  netListener({ isConnected: false })
  expect(onlineManager.isOnline()).toBe(false)
  netListener({ isConnected: true })
  expect(onlineManager.isOnline()).toBe(true)
})
