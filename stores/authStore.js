// authStore.js
// The logged-in user and the role they use the app in (client or tasker). `restoring` is on from the
// start until the stored session is restored or found missing (useSessionStart): until then nobody is
// known to be signed out, so the app waits (the intro, a tapped push) instead of showing a guest.
import { create } from "zustand"

import { withSetters } from "./fields"

export const LOGGED_OUT_USER = { loggedIn: false, type: "CLIENT", userData: {} }

const useAuthStore = create((set) =>
  withSetters(set, {
    user: LOGGED_OUT_USER,
    restoring: true,
    userSelect: "CLIENT", // "CLIENT" or "TASKER"
    preEmail: null // an email to fill the login form with (e.g. after registering)
  })
)

export default useAuthStore
