// useChatMessages.js
// A conversation's messages, oldest first, loaded a page at a time from the newest (older pages as the
// chat is scrolled up), and adding one to them (sent, or received live).
import { useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useCursorList from "./useCursorList"
import { getMessages } from "../../Services/NotificationsAPI"
import useAlert from "../useAlert"
import useEvent from "../useEvent"
import useListSpinner from "../useListSpinner"
import { apiError } from "../../Helpers/apiErrors"

export const chatKeys = {
  messages: (conversationId) => ["chat", "messages", conversationId]
}

export const useChatMessages = (conversationId) => {
  const { showError } = useAlert()
  const list = useCursorList({ queryKey: chatKeys.messages(conversationId), fetchPage: (cursor) => getMessages(conversationId, cursor), enabled: !!conversationId })

  // the API pages newest first; the chat reads oldest first
  const messages = useMemo(() => [...list.items].reverse(), [list.items])

  // the first load shows the global spinner, as before
  useListSpinner(list.isLoading)

  // each failed load (errorUpdatedAt changes) shows the error it failed with
  const reportError = useEvent(() => showError("useChatMessages.errorWhileRetrievingConversation", apiError(list.error)?.message || "useChatMessages.pleaseTryAgainLater"))
  useEffect(() => {
    if (list.errorUpdatedAt) reportError()
  }, [list.errorUpdatedAt, reportError])

  return { messages, canLoadMore: list.canLoadMore, loadMore: list.loadMore, fetching: list.isFetching }
}

// the message goes first on the newest page (once: a message already there by its id is not added again)
export const withMessage = (data, message) => {
  if (!data || !data.pages.length) return { pages: [{ data: [message], meta: { next_cursor: null } }], pageParams: [null] }
  if (message.id != null && data.pages.some((page) => (page.data || []).some((known) => known.id === message.id))) return data
  const [newest, ...older] = data.pages
  return { ...data, pages: [{ ...newest, data: [message, ...(newest.data || [])] }, ...older] }
}

export const useAddChatMessage = () => {
  const queryClient = useQueryClient()
  return (conversationId, message) => queryClient.setQueryData(chatKeys.messages(conversationId), (data) => withMessage(data, message))
}
