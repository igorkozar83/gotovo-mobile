// live.js
// Live updates over the echo server (socket.io).
import Echo from "laravel-echo"
import socketio from "socket.io-client"
import Constants from "expo-constants"

import { getToken } from "./authToken"
import { reportError } from "../Helpers/reportError"

// One socket.io connection for the whole app, open while at least one channel is subscribed.
// The channels are private: the echo server lets the socket join one only after the API confirmed,
// with the user's token sent along, that it is the user's own (BroadcastAuthController).
// The backend (EchoService) sends every event as "BroadcastMessage", hence the leading dot:
// without it Echo would wait for "App\Events\BroadcastMessage", which is never sent.
const EVENT = ".BroadcastMessage"
const PRIVATE = "private-"

let echo = null
const subscribers = {} // channel name -> number of active subscriptions
const reconnectHandlers = new Set()

// the connection, sending `token` when it joins a channel (also on an open one: the user may have
// logged in again)
const client = (token) => {
  if (!echo) {
    echo = new Echo({ host: Constants.expoConfig.extra.SOCKET_URL, broadcaster: "socket.io", client: socketio })
    echo.connector.socket.on("connect_error", (error) => reportError(error, "live.connect"))
    echo.connector.socket.on("subscription_error", (channel, status) => reportError(status, "live.subscribe " + channel))
    // back after a drop (the network, the app in the background): events sent meanwhile were missed
    echo.connector.socket.on("reconnect", () => reconnectHandlers.forEach((handler) => handler()))
  }
  echo.connector.options.auth.headers.Authorization = "Bearer " + token
  return echo
}

// calls handler() each time the connection comes back after a drop, until the returned function is called
export const onReconnect = (handler) => {
  reconnectHandlers.add(handler)
  return () => reconnectHandlers.delete(handler)
}

// calls handler(payload) for every event on the user's channel `name` until the returned function is
// called (then nothing more is called, even if the channel was not joined yet)
export const subscribe = (name, handler) => {
  subscribers[name] = (subscribers[name] || 0) + 1
  let channel = null
  let active = true

  getToken()
    .then((token) => {
      if (!active) return
      channel = client(token).private(name)
      channel.listen(EVENT, handler)
    })
    // no socket: screens still load their data on focus
    .catch((error) => reportError(error, "live.subscribe"))

  return () => {
    active = false
    if (channel) channel.stopListening(EVENT, handler)
    subscribers[name] -= 1
    if (subscribers[name]) return

    delete subscribers[name]
    if (!echo) return
    echo.leaveChannel(PRIVATE + name)

    // nothing left to listen to (e.g. after logout): close the connection
    if (!Object.keys(subscribers).length) {
      echo.disconnect()
      echo = null
    }
  }
}
