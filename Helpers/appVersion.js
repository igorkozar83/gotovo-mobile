// appVersion.js
// The app's version against the oldest one the API still serves (GET settings: min_app_version).
import Constants from "expo-constants"
import { Platform } from "react-native"

// "1.2.10" -> [1, 2, 10] (anything not a number counts as 0)
const parts = (version) =>
  String(version || "")
    .split(".")
    .map((part) => parseInt(part, 10) || 0)

// whether version is older than minimum ("0.1.7" < "0.2.0"); no minimum, or no version known: never
export const isOlder = (version, minimum) => {
  if (!minimum || !version) return false
  const [a, b] = [parts(version), parts(minimum)]
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0)
  }
  return false
}

// the installed app's version (app.config.js "version")
export const appVersion = () => Constants.expoConfig.version

// where the user updates the app: app.config.js ios.appStoreUrl on iOS, the Play Store page of the package otherwise
export const storeUrl = () =>
  Platform.OS === "ios" && Constants.expoConfig.ios?.appStoreUrl
    ? Constants.expoConfig.ios.appStoreUrl
    : "https://play.google.com/store/apps/details?id=" + (Constants.expoConfig.android?.package || "com.gotovosrb.app")
