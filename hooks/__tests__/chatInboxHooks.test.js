import { act, waitFor } from "@testing-library/react-native"

import useChat from "../chat/useChat"
import useConversation from "../chat/useConversation"
import { useChatMessages, chatKeys } from "../queries/useChatMessages"
import useNotificationTarget from "../notifications/useNotificationTarget"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import { renderHookWithQuery } from "../../testUtils/render"
import { refused } from "../../testUtils/api"
import * as NotificationsAPI from "../../Services/NotificationsAPI"
import * as TasksAPI from "../../Services/TasksAPI"
import { subscribe } from "../../Services/live"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/live", () => ({ subscribe: jest.fn(() => () => {}) }))
jest.mock("../../Services/NotificationsAPI", () => ({
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  readMessages: jest.fn(),
  checkConversation: jest.fn(),
  readNotification: jest.fn(),
  countNotifications: jest.fn()
}))
jest.mock("../../Services/TasksAPI", () => ({ readTasksQuestionsTasker: jest.fn(), getTaskById: jest.fn(), getTaskOffer: jest.fn() }))

const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const me = { id: 6, type: "CLIENT", channel: "ch6", full_name: "Ana", avatar: "a.jpg" }
const conversation = { id: 3, messages_count: 2 }
// a page of the newest messages, newest first
const page = (messages, nextCursor = null) => ({ data: messages, meta: { next_cursor: nextCursor } })

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: me }, userSelect: "CLIENT" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false }, modals: {} })
  useUiStore.setState({ spinners: 0 })
  NotificationsAPI.readMessages.mockResolvedValue(undefined)
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("a conversation", () => {
  it("shows the messages oldest first and marks them read", async () => {
    NotificationsAPI.getMessages.mockResolvedValue(page([{ id: 2 }, { id: 1 }]))
    const { result, client } = await renderHookWithQuery(() => useChat(conversation, { onSendFailed: jest.fn() }))
    await waitFor(() => expect(result.current.messages.map((m) => m.id)).toEqual([1, 2]))
    await waitFor(() => expect(NotificationsAPI.readMessages).toHaveBeenCalledWith(3))
    expect(client.getQueryData(chatKeys.messages(3)).pages[0].data).toHaveLength(2)
  })

  it("older messages load a page at a time, above the ones shown", async () => {
    NotificationsAPI.getMessages.mockResolvedValueOnce(page([{ id: 4 }, { id: 3 }], "older")).mockResolvedValueOnce(page([{ id: 2 }, { id: 1 }]))
    const { result } = await renderHookWithQuery(() => useChat(conversation, { onSendFailed: jest.fn() }))
    await waitFor(() => expect(result.current.canLoadMore).toBe(true))
    await act(async () => result.current.loadMore())
    await waitFor(() => expect(result.current.messages.map((m) => m.id)).toEqual([1, 2, 3, 4]))
    expect(NotificationsAPI.getMessages).toHaveBeenLastCalledWith(3, "older")
    expect(result.current.canLoadMore).toBe(false)
  })

  it("a sent message is added right away and the draft is cleared", async () => {
    NotificationsAPI.getMessages.mockResolvedValue(page([]))
    NotificationsAPI.sendMessage.mockResolvedValue({ id: 5, message: "Zdravo" })
    const { result } = await renderHookWithQuery(() => useChat(conversation, { onSendFailed: jest.fn() }))
    await act(async () => result.current.submit())
    expect(NotificationsAPI.sendMessage).not.toHaveBeenCalled()

    await act(async () => result.current.setDraft("Zdravo"))
    await act(async () => result.current.submit())
    expect(NotificationsAPI.sendMessage).toHaveBeenCalledWith(3, "Zdravo")
    await waitFor(() => expect(result.current.messages).toHaveLength(1))
    expect(result.current.messages[0]).toMatchObject({ id: 5, conversation_id: 3, user_id: 6, message: "Zdravo", user: { full_name: "Ana" } })
    expect(result.current.draft).toBe("")
  })

  it("a failed send tells the caller", async () => {
    NotificationsAPI.getMessages.mockResolvedValue(page([]))
    NotificationsAPI.sendMessage.mockRejectedValue(new Error("offline"))
    const onSendFailed = jest.fn()
    const { result } = await renderHookWithQuery(() => useChat(conversation, { onSendFailed }))
    await act(async () => result.current.setDraft("Zdravo"))
    await act(async () => result.current.submit())
    expect(onSendFailed).toHaveBeenCalled()
  })

  it("a message from the other side arrives live, only in its own conversation", async () => {
    NotificationsAPI.getMessages.mockResolvedValue(page([]))
    const { result } = await renderHookWithQuery(() => useChat(conversation, { onSendFailed: jest.fn() }))
    expect(subscribe).toHaveBeenCalledWith("hotovo-refresh-chat-ch6", expect.any(Function))
    const deliver = subscribe.mock.calls[0][1]
    await act(async () => {
      deliver({ message: { id: 8, conversation: 99, user_id: 7, message: "Drugde", sender: {} } })
      deliver({ message: { id: 9, conversation: 3, user_id: 7, message: "Stižem", sender: { full_name: "Majstor" } } })
      // the same message again (a reconnect) is not shown twice
      deliver({ message: { id: 9, conversation: 3, user_id: 7, message: "Stižem", sender: { full_name: "Majstor" } } })
    })
    await waitFor(() => expect(result.current.messages.map((m) => m.message)).toEqual(["Stižem"]))
  })

  it("a conversation that can't be loaded shows why", async () => {
    NotificationsAPI.getMessages.mockRejectedValue(refused(404, "not_found", "Not yours"))
    await renderHookWithQuery(() => useChatMessages(3))
    await waitFor(() => expect(alert()).toMatchObject({ title: "Error while retrieving conversation", text: "Not yours" }))
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("the conversation with a user about a task is found or created", async () => {
    NotificationsAPI.checkConversation.mockResolvedValue({ id: 8 })
    const { result } = await renderHookWithQuery(() => useConversation({ userId: 7, taskId: 9 }))
    await waitFor(() => expect(result.current).toEqual({ id: 8 }))
    expect(NotificationsAPI.checkConversation).toHaveBeenCalledWith(7, 9)

    const opened = await renderHookWithQuery(() => useConversation({ conversation: { id: 3 } }))
    expect(opened.result.current).toEqual({ id: 3 })
  })
})

describe("a notification tapped in the inbox", () => {
  it("opens an offer", async () => {
    TasksAPI.getTaskOffer.mockResolvedValue({ id: 30 })
    const { result, client } = await renderHookWithQuery(() => useNotificationTarget())
    await act(async () => result.current({ type: "new-task-offer", taskOfferId: 30 }))
    expect(client.getQueryData(["taskOffer", 30])).toEqual({ id: 30 })
    expect(mockNavigate).toHaveBeenCalledWith("TaskOffer", { offerId: 30 })
  })

  it("opens a task in its details, a finished one in the finished details (by its id)", async () => {
    TasksAPI.getTaskById.mockResolvedValueOnce({ id: 9, status: 1 }).mockResolvedValueOnce({ id: 10, status: 2 })
    const { result, client } = await renderHookWithQuery(() => useNotificationTarget())
    await act(async () => result.current({ type: "claim-complete", taskId: 9 }))
    expect(mockNavigate).toHaveBeenCalledWith("MyTaskDetails", { taskId: 9 })
    client.clear()
    await act(async () => result.current({ type: "edit-task-offer", task: { task: { id: 10 } } }))
    expect(mockNavigate).toHaveBeenLastCalledWith("MyTaskFinished", { taskId: 10 })
  })

  it("a review opens over the reviews; a message opens the chat; a question the Q&A tab", async () => {
    const { result } = await renderHookWithQuery(() => useNotificationTarget())
    await act(async () => {
      result.current({ type: "review-received", name: "Majstor", taskId: 9 })
      result.current({ type: "new-message-received", userId: 7, taskId: 9 })
      result.current({ type: "answer-task-question" })
    })
    expect(mockNavigate.mock.calls).toEqual([["MyReviews"], ["Chat", { userId: 7, taskId: 9 }], ["Notifications", { qa: true }]])
  })
})
