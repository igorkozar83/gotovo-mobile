// crashReporting.js
// Sentry: crashes, unhandled JS errors and the errors the app reports (Helpers/reportError). Off until a
// DSN is set (app.config.js extra.SENTRY_DSN, from the SENTRY_DSN build variable): without one nothing is
// started and nothing is sent. Turning it on is docs/sentry.md. What is sent is cut down (scrub): the user
// by id only; no request bodies, headers or cookies; URLs without their query; breadcrumbs with only the
// URL, method and status; e-mail addresses masked. (Device and app details the SDK adds stay.)
import * as Sentry from "@sentry/react-native"
import Constants from "expo-constants"

import useAuthStore from "../stores/authStore"

const EMAIL = /[^\s@"']+@[^\s@"']+\.[^\s@"']+/g
const KEPT_CRUMB_DATA = ["url", "method", "status_code"]

const withoutQuery = (url) => (typeof url === "string" ? url.split("?")[0] : url)

const extra = () => Constants.expoConfig?.extra || {}

let started = false

export const crashReportingEnabled = () => started

// what is sent, without personal data
export const scrub = (event) => {
  if (event.request) {
    delete event.request.data
    delete event.request.cookies
    delete event.request.headers
    delete event.request.query_string
    if (event.request.url) event.request.url = withoutQuery(event.request.url)
  }
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined
  if (event.message) event.message = event.message.replace(EMAIL, "[email]")
  for (const exception of event.exception?.values || []) {
    if (exception.value) exception.value = exception.value.replace(EMAIL, "[email]")
  }
  for (const crumb of event.breadcrumbs || []) {
    if (crumb.message) crumb.message = crumb.message.replace(EMAIL, "[email]")
    if (crumb.data) {
      crumb.data = Object.fromEntries(Object.entries(crumb.data).filter(([key]) => KEPT_CRUMB_DATA.includes(key)))
      if (crumb.data.url) crumb.data.url = withoutQuery(crumb.data.url)
    }
  }
  return event
}

// starts Sentry when a DSN is set (once, before the app renders: App.js)
export const initCrashReporting = () => {
  const dsn = extra().SENTRY_DSN
  if (started || !dsn) return false

  Sentry.init({
    dsn,
    environment: extra().SENTRY_ENVIRONMENT || (__DEV__ ? "development" : "production"),
    enabled: !__DEV__ || Boolean(extra().SENTRY_IN_DEV),
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrub,
    beforeBreadcrumb: (crumb) => (crumb.category === "console" ? null : crumb)
  })
  started = true

  // the signed-in user, by id only
  const setUser = (state) => Sentry.setUser(state.user.loggedIn && state.user.userData?.id ? { id: String(state.user.userData.id) } : null)
  setUser(useAuthStore.getState())
  useAuthStore.subscribe(setUser)
  return true
}

// a caught error, with where it happened (`context`)
export const captureError = (error, context) => {
  if (!started) return
  Sentry.captureException(error instanceof Error ? error : new Error(String(error?.message || error)), { tags: { context: String(context || "unknown").slice(0, 200) } })
}
