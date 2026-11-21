// queryClient.js
// The server state cache. A screen's data reloads when it is shown (its queries are enabled on focus),
// on the socket's events (useLiveChannels, the screens' own channels), and: when the app comes back to
// the front (AppState: TanStack's focus) and when the connection comes back (NetInfo: online), each
// reloading the queries on screen, so nothing missed meanwhile stays out of date.
import { AppState } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query"

// the app in the front counts as focused; a connection as online (queries wait for it, then reload; a
// connection not known yet, at the start, counts as one)
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state) => handleFocus(state === "active"))
  return () => subscription.remove()
})
onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)))

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, refetchOnReconnect: true },
    // an action is sent even offline, and fails at once with its error (instead of waiting, paused, for a
    // connection with its spinner up)
    mutations: { networkMode: "always" }
  }
})
