// pushNotifications.js
// Registering the device for Expo push notifications (Notifications.getExpoPushTokenAsync), and a new
// token when the system replaces the device's (onPushTokenChange).
import { Platform } from "react-native"
import Constants from "expo-constants"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"

import { reportError } from "../Helpers/reportError"
import { palette } from "../styles/palette"

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// the Expo push token of this installation, or undefined when it can't be had: a failure (often the
// network for a moment) is tried again, 3 times in all, 2 and 4 seconds apart
export const expoToken = async (attempts = 3, delay = 2000) => {
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data
  } catch (e) {
    if (attempts > 1) {
      await wait(delay)
      return expoToken(attempts - 1, delay * 2)
    }
    reportError(e, "pushNotifications")
    return undefined
  }
}

/**
 * Asks for the notification permission once and registers the device with Expo.
 * Resolves to the Expo push token, or undefined (no permission, or not a physical device).
 */
export const registerForPushNotifications = async () => {
  let token

  if (Device.isDevice) {
    const { status: existing } = await Notifications.getPermissionsAsync()
    const status = existing === "granted" ? existing : (await Notifications.requestPermissionsAsync()).status
    if (status !== "granted") return undefined

    token = await expoToken()
  }
  // (an emulator or simulator gets no push token: nothing to register)

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: palette.notificationLight
    })
  }

  return token
}

// calls handler(expoToken) each time the system replaces the device's push token (the Expo token
// follows it), until the returned function is called. The listener also hears the device token every
// time it is asked for, getExpoPushTokenAsync included: asking for the Expo token on each of those
// asked for the device token again, in a loop that kept the JavaScript thread busy and the app
// unresponsive. Only a device token that differs from the one before leads to a new Expo token.
export const onPushTokenChange = (handler) => {
  let deviceToken = null
  const subscription = Notifications.addPushTokenListener(async (event) => {
    const changed = event && event.data
    if (!changed || changed === deviceToken) return
    deviceToken = changed
    const token = await expoToken()
    // (a newer device token came meanwhile: its own answer counts, not this one)
    if (token && deviceToken === changed) handler(token)
  })
  return () => subscription.remove()
}
