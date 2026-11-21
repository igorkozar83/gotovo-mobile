// reportError.js
// Where the app's caught errors go: the console while developing, and the crash reporter (Sentry, once
// it is turned on: Services/crashReporting) in every build.
//   context: where it happened, e.g. "live.subscribe"
import { captureError } from "../Services/crashReporting"

export const reportError = (error, context) => {
  if (__DEV__) console.log(`[${context}]`, error)
  captureError(error, context)
}
