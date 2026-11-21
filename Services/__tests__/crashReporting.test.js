// The crash reporter: off without a DSN; with one, started once, the user known by id only, caught errors
// sent with where they happened, and no personal data in what is sent.
import * as Sentry from "@sentry/react-native"
import Constants from "expo-constants"

// a fresh module (it starts once), with the auth store it reads
const load = () => {
  let mod
  jest.isolateModules(() => {
    mod = { ...require("../crashReporting"), useAuthStore: require("../../stores/authStore").default }
    mod.useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, email: "ana@example.test" } } })
  })
  return mod
}
const withDsn = (dsn) => (Constants.expoConfig.extra.SENTRY_DSN = dsn)

beforeEach(() => {
  jest.clearAllMocks()
  withDsn("")
})

it("without a DSN nothing starts and nothing is sent", () => {
  const { initCrashReporting, captureError, crashReportingEnabled } = load()
  expect(initCrashReporting()).toBe(false)
  captureError(new Error("x"), "here")
  expect(Sentry.init).not.toHaveBeenCalled()
  expect(Sentry.captureException).not.toHaveBeenCalled()
  expect(crashReportingEnabled()).toBe(false)
})

it("with a DSN: started once, no personal data, the user by id", () => {
  withDsn("https://key@o1.ingest.sentry.io/2")
  const { initCrashReporting, useAuthStore } = load()
  expect(initCrashReporting()).toBe(true)
  expect(initCrashReporting()).toBe(false)
  expect(Sentry.init).toHaveBeenCalledTimes(1)
  expect(Sentry.init.mock.calls[0][0]).toMatchObject({ dsn: "https://key@o1.ingest.sentry.io/2", sendDefaultPii: false })
  expect(Sentry.setUser).toHaveBeenLastCalledWith({ id: "6" })
  useAuthStore.setState({ user: { loggedIn: false, userData: {} } })
  expect(Sentry.setUser).toHaveBeenLastCalledWith(null)
})

it("a caught error goes out with its place", () => {
  withDsn("https://key@o1.ingest.sentry.io/2")
  const { initCrashReporting, captureError } = load()
  initCrashReporting()
  const error = new Error("boom")
  captureError(error, "live.subscribe")
  expect(Sentry.captureException).toHaveBeenCalledWith(error, { tags: { context: "live.subscribe" } })
  captureError("not an error", "api")
  expect(Sentry.captureException.mock.calls[1][0]).toBeInstanceOf(Error)
})

it("scrub drops request bodies, headers, queries, breadcrumb data, e-mails and all but the user's id", () => {
  const { scrub } = load()
  const event = scrub({
    request: { data: "{password}", headers: { Authorization: "Bearer t" }, cookies: "c", url: "https://x/api?token=t", query_string: "token=t" },
    user: { id: "6", email: "ana@example.test", ip_address: "1.2.3.4" },
    message: "failed for ana@example.test",
    exception: { values: [{ value: "no user marko@example.test" }] },
    breadcrumbs: [{ message: "login ana@example.test", data: { body: "{secret}", password: "p", url: "/x?email=a", method: "POST", status_code: 422 } }]
  })
  expect(event.request).toEqual({ url: "https://x/api" })
  expect(event.user).toEqual({ id: "6" })
  expect(event.message).toBe("failed for [email]")
  expect(event.exception.values[0].value).toBe("no user [email]")
  expect(event.breadcrumbs[0]).toEqual({ message: "login [email]", data: { url: "/x", method: "POST", status_code: 422 } })
})
