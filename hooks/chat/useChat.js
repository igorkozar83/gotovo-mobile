// useChat.js
// A conversation's messages and what happens to them: the ones sent by the other side arrive live,
// opening them marks them read, and a sent message is added right away.
import { useEffect, useState } from "react"

import useAuthStore from "../../stores/authStore"
import useApiAction from "../useApiAction"
import useLiveChannel from "../useLiveChannel"
import { useRefreshInboxCount } from "../queries/useInboxCount"
import { useMarkConversationRead } from "../queries/useInbox"
import { useChatMessages, useAddChatMessage } from "../queries/useChatMessages"
import { sendMessage, readMessages } from "../../Services/NotificationsAPI"
import { requiredFieldsMessage } from "../../Helpers/apiErrors"
import { zuluT } from "../../Helpers"
import { smallAvatar } from "../../Helpers/pictures"

// id: the server's id of the message
const chatMessage = (id, conversationId, userId, text, sender) => ({
  id,
  conversation_id: conversationId,
  user_id: userId,
  message: text,
  status: 1,
  created_at: zuluT(),
  user: { avatar: smallAvatar(sender), full_name: sender.full_name, last_name: sender.last_name }
})

const useChat = (conversation, { onSendFailed }) => {
  const me = useAuthStore((state) => state.user.userData)
  const { messages, canLoadMore, loadMore, fetching } = useChatMessages(conversation?.id)
  const addMessage = useAddChatMessage()
  const refreshInboxCount = useRefreshInboxCount()
  const setReadConversation = useMarkConversationRead()
  const [draft, setDraft] = useState("")

  // opening the conversation marks its messages read (quietly, in the background)
  const { run: markRead } = useApiAction(readMessages, {
    spinner: false,
    onSuccess: (resp, conversationId) => {
      refreshInboxCount()
      setReadConversation(conversationId)
    }
  })
  useEffect(() => {
    if (conversation?.id && conversation.messages_count) markRead(conversation.id)
  }, [conversation, messages.length, markRead])

  useLiveChannel(me?.channel && "hotovo-refresh-chat-" + me.channel, (payload) => {
    const message = payload && payload.message
    if (!conversation || !message || message.conversation !== conversation.id) return
    addMessage(conversation.id, chatMessage(message.id, conversation.id, message.user_id, message.message, message.sender))
  })

  const send = useApiAction(sendMessage, {
    error: "useChat.errorWhileSendingMessage",
    invalid: requiredFieldsMessage,
    failedTitle: "useChat.errorWhileSendingMessage1",
    failed: "useChat.thereWasAnErrorWhileSending",
    onSuccess: (resp, conversationId, text) => {
      setDraft("")
      addMessage(conversationId, chatMessage(resp?.id, conversationId, me?.id, text, me))
    },
    onError: () => onSendFailed()
  })

  return {
    messages,
    canLoadMore,
    loadMore,
    fetching,
    draft,
    setDraft,
    submit: () => {
      if (draft && conversation?.id) send.run(conversation.id, draft)
    }
  }
}

export default useChat
