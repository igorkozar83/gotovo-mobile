// NotificationsAPI.js
// The inbox: its counts, conversations and messages, notifications, and the calendar (API v2: a list resolves to its
// page { data, meta: { next_cursor } }, any other call to the answer's data, or nothing).
import { api } from "./client"
import { checkData, inboxCountSchema, conversationsPageSchema, notificationsPageSchema } from "./schemas"

const checkCount = checkData(inboxCountSchema, "inbox/counts")
const checkConversations = checkData(conversationsPageSchema, "conversations")
const checkNotifications = checkData(notificationsPageSchema, "notifications")

// the messages of a conversation loaded at a time
const MESSAGES = 30

// { count_questions, count_offers, count_messages, count_notifications } for the role the user is in
export const countNotifications = async () => checkCount((await api.get("inbox/counts")).data.data)

// the conversation of the two about the task (opened if new)
export const checkConversation = async (userId, taskId) => (await api.post("conversations", { user_id: userId, task_id: taskId })).data.data

// the message sent
export const sendMessage = async (conversationId, message) => (await api.post("conversations/" + conversationId + "/messages", { message })).data.data

export const readMessages = async (conversationId) => {
  await api.post("conversations/" + conversationId + "/read")
}

export const getConversations = async (cursor) => checkConversations((await api.get("conversations", { params: { cursor } })).data)

export const getNotifications = async (cursor, perPage) => checkNotifications((await api.get("notifications", { params: { cursor, per_page: perPage } })).data)

// a page of a conversation's messages, newest first (cursor: the older page after the one before)
export const getMessages = async (conversationId, cursor) => (await api.get("conversations/" + conversationId + "/messages", { params: { cursor, per_page: MESSAGES } })).data

export const readNotification = async (notificationId) => {
  await api.post("notifications/" + notificationId + "/read")
}

// every unread notification read; { read: how many were unread }
export const readAllNotifications = async () => (await api.post("notifications/read")).data.data

export const getCalendar = async () => (await api.get("calendar")).data.data
