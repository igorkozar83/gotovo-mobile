// useInbox.js
// The inbox lists (chat conversations, Q&A, notifications, offers), each loaded page by page, and the
// changes made to them in the cache (read marks, reloads).
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useCursorList from "./useCursorList"

import { getConversations, getNotifications } from "../../Services/NotificationsAPI"
import { getAllTaskQuestions, getTaskOffers } from "../../Services/TasksAPI"

export const inboxKeys = {
  conversations: ["inbox", "conversations"],
  questions: (userType) => ["inbox", "questions", userType],
  notifications: ["inbox", "notifications"],
  offers: ["inbox", "offers"]
}

// the chat's conversations
export const useConversations = (enabled) => {
  const list = useCursorList({ queryKey: inboxKeys.conversations, fetchPage: getConversations, enabled })
  return { ...list, conversations: list.items }
}

// Q&A of the user's tasks for the current role
export const useTaskQuestions = (userType, enabled) => {
  const list = useCursorList({ queryKey: inboxKeys.questions(userType), fetchPage: getAllTaskQuestions, enabled })
  return { ...list, questions: list.items }
}

const fetchNotifications = (cursor) => getNotifications(cursor, 20)

// the notifications tab
export const useNotificationsList = (enabled) => {
  const list = useCursorList({ queryKey: inboxKeys.notifications, fetchPage: fetchNotifications, enabled })
  return { ...list, notifications: list.items }
}

// changes every loaded page of a cached list (a list not loaded yet stays as it is)
const updatePages = (queryClient, queryKey, updatePage) => queryClient.setQueryData(queryKey, (data) => (data ? { ...data, pages: data.pages.map(updatePage) } : data))

// marks a notification read in the cached list
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useCallback(
    (notificationId) => updatePages(queryClient, inboxKeys.notifications, (page) => ({ ...page, data: page.data.map((n) => (n.id === notificationId ? { ...n, status: 1 } : n)) })),
    [queryClient]
  )
}

// every loaded notification shown read (after "mark all as read")
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useCallback(() => updatePages(queryClient, inboxKeys.notifications, (page) => ({ ...page, data: page.data.map((n) => ({ ...n, status: 1 })) })), [queryClient])
}

// offers of the user's tasks: all of them, or those of one task (filter { task_id }); sorted
export const useOffersList = ({ filter, sort, sortPrice }, enabled) => {
  const list = useCursorList({
    queryKey: [...inboxKeys.offers, filter, sort, sortPrice],
    fetchPage: (cursor) => getTaskOffers(cursor, filter, { sort, sort_price: sortPrice }),
    enabled
  })
  return { ...list, offers: list.items }
}

// every offers list (any filter or sort) reloads when shown next; the visible one right away
export const useInvalidateOffers = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: inboxKeys.offers }), [queryClient])
}

export const useInvalidateConversations = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: inboxKeys.conversations }), [queryClient])
}

// clears the unread badge of a conversation in the cached list
export const useMarkConversationRead = () => {
  const queryClient = useQueryClient()
  return useCallback(
    (conversationId) =>
      updatePages(queryClient, inboxKeys.conversations, (page) => ({
        ...page,
        data: page.data.map((conv) => (conv.id === conversationId ? { ...conv, messages_count: 0 } : conv))
      })),
    [queryClient]
  )
}
