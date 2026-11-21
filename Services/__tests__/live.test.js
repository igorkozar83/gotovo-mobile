import Echo from "laravel-echo"

import { subscribe, onReconnect } from "../live"
import { getToken } from "../authToken"

jest.mock("../authToken", () => ({ getToken: jest.fn() }))
jest.mock("socket.io-client", () => ({}))
jest.mock("laravel-echo", () => {
  const instances = []
  const MockEcho = jest.fn().mockImplementation(() => {
    const channels = {}
    const echo = {
      connector: { options: { auth: { headers: {} } }, socket: { on: jest.fn() } },
      channels,
      private: jest.fn((name) => {
        channels[name] = channels[name] || { listen: jest.fn(), stopListening: jest.fn() }
        return channels[name]
      }),
      leaveChannel: jest.fn(),
      disconnect: jest.fn()
    }
    instances.push(echo)
    return echo
  })
  MockEcho.instances = instances
  return { __esModule: true, default: MockEcho }
})

const flush = () => new Promise((resolve) => setImmediate(resolve))
const lastEcho = () => Echo.instances[Echo.instances.length - 1]

beforeEach(() => {
  jest.clearAllMocks()
  getToken.mockResolvedValue("tok-1")
})

describe("live channels", () => {
  it("joins the user's channel as a private channel with their token", async () => {
    const handler = jest.fn()
    const leave = subscribe("hotovo-refresh-chat-abc", handler)
    await flush()

    const echo = lastEcho()
    expect(echo.private).toHaveBeenCalledWith("hotovo-refresh-chat-abc")
    expect(echo.connector.options.auth.headers.Authorization).toBe("Bearer tok-1")
    expect(echo.channels["hotovo-refresh-chat-abc"].listen).toHaveBeenCalledWith(".BroadcastMessage", handler)
    leave()
  })

  it("leaving the last channel leaves it and closes the connection", async () => {
    const handler = jest.fn()
    const leaveA = subscribe("hotovo-refresh-offers-abc", handler)
    const leaveB = subscribe("hotovo-refresh-tasks-abc", handler)
    await flush()
    const echo = lastEcho()
    expect(Echo).toHaveBeenCalledTimes(1)

    leaveA()
    expect(echo.leaveChannel).toHaveBeenCalledWith("private-hotovo-refresh-offers-abc")
    expect(echo.disconnect).not.toHaveBeenCalled()

    leaveB()
    expect(echo.channels["hotovo-refresh-tasks-abc"].stopListening).toHaveBeenCalledWith(".BroadcastMessage", handler)
    expect(echo.disconnect).toHaveBeenCalled()
  })

  it("a channel left before its token was read is never joined", async () => {
    const leave = subscribe("hotovo-open-modal-abc", jest.fn())
    leave()
    await flush()
    expect(Echo).not.toHaveBeenCalled()
  })

  it("a new login on an open connection sends the new token", async () => {
    const leaveA = subscribe("hotovo-refresh-chat-abc", jest.fn())
    await flush()
    getToken.mockResolvedValue("tok-2")
    const leaveB = subscribe("hotovo-refresh-chat-def", jest.fn())
    await flush()
    expect(lastEcho().connector.options.auth.headers.Authorization).toBe("Bearer tok-2")
    leaveA()
    leaveB()
  })

  it("without a token store nothing breaks: the error is only reported", async () => {
    getToken.mockRejectedValue(new Error("SecureStore unavailable"))
    jest.spyOn(console, "log").mockImplementation(() => {})
    const leave = subscribe("hotovo-refresh-chat-abc", jest.fn())
    await flush()
    expect(Echo).not.toHaveBeenCalled()
    leave()
  })
})

describe("the connection back after a drop", () => {
  it("tells the listeners, until they stop listening", async () => {
    const handler = jest.fn()
    const stop = onReconnect(handler)
    const leave = subscribe("hotovo-refresh-chat-abc", jest.fn())
    await flush()
    const reconnect = lastEcho().connector.socket.on.mock.calls.find(([event]) => event === "reconnect")[1]
    reconnect()
    expect(handler).toHaveBeenCalledTimes(1)
    stop()
    reconnect()
    expect(handler).toHaveBeenCalledTimes(1)
    leave()
  })
})
