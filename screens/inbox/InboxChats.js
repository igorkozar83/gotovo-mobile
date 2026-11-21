// InboxChats.js
// The inbox's CHAT tab: the user's conversations; one opens its chat. Loads while it is shown.
import React from "react"
import { useIsFocused } from "@react-navigation/native"

import ChatList from "../../components/inbox/ChatList"
import useListSpinner from "../../hooks/useListSpinner"
import { useConversations } from "../../hooks/queries/useInbox"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { inboxRoute } from "./inboxTabs"

export default function InboxChats({ navigation }) {
  const isFocused = useIsFocused()
  const meId = useAuthStore((state) => state.user.userData.id)
  const language = useUiStore((state) => state.language)

  const chatList = useConversations(isFocused)
  useListSpinner(isFocused && chatList.isFetching)

  return (
    <ChatList
      conversations={chatList.conversations}
      meId={meId}
      language={language}
      onOpen={(conversation) => navigation.navigate("Chat", { conversation })}
      fetching={chatList.isFetching}
      canLoadMore={chatList.canLoadMore}
      onLoadMore={chatList.loadMore}
      tab="CHAT"
      onTab={(key) => navigation.navigate(inboxRoute(key))}
    />
  )
}
