// Chat.js
// A conversation about a task. Opened from the inbox's chat list ({ conversation }) or from a task, a
// modal or a notification ({ userId, taskId }). The messages start at the newest; older ones load as
// they are scrolled up. Back returns to where it was opened from; the tabs on top open the inbox.
import React, { useEffect, useRef } from "react"
import { View, Platform, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import ChatHeader from "../components/chat/ChatHeader"
import ChatMessages from "../components/chat/ChatMessages"
import ChatInput from "../components/chat/ChatInput"
import useConversation from "../hooks/chat/useConversation"
import useChat from "../hooks/chat/useChat"
import useChatKeyboard from "../hooks/chat/useChatKeyboard"
import useCollapsingHeader from "../hooks/chat/useCollapsingHeader"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import useEvent from "../hooks/useEvent"
import { palette } from "../styles/palette"

const Chat = ({ route }) => {
  const navigation = useNavigation()
  const userSelect = useAuthStore((state) => state.userSelect)
  const myId = useAuthStore((state) => state.user.userData?.id)
  const language = useUiStore((state) => state.language)
  const { setOpenMenuContext } = useUiStore.getState()

  const listRef = useRef(null)
  const scrollBottom = () => listRef.current && listRef.current.scrollToEnd({ animated: true })

  const conversation = useConversation(route.params || {})
  const chat = useChat(conversation, { onSendFailed: scrollBottom })
  const keyboard = useChatKeyboard(scrollBottom)
  const header = useCollapsingHeader(keyboard)

  // the inbox, on the given tab
  const toInbox = useEvent((tab) => {
    setOpenMenuContext(false)
    navigation.navigate("Notifications", { tab })
  })

  // a new newest message (sent or arrived) scrolls into view; older ones loaded above it do not
  const newest = chat.messages.length ? chat.messages[chat.messages.length - 1] : null
  const newestId = newest ? (newest.id ?? newest.created_at) : null
  useEffect(() => {
    if (newestId == null) return
    const timer = setTimeout(scrollBottom, 300)
    return () => clearTimeout(timer)
  }, [newestId])

  const ios = Platform.OS === "ios"
  return (
    <View style={styles.screen}>
      <ChatHeader taskName={conversation?.task?.name || ""} userSelect={userSelect} translateY={header.translateY} onBack={() => navigation.goBack()} onTab={toInbox} />
      <View style={styles.messages}>
        <ChatMessages
          ref={listRef}
          messages={chat.messages}
          canLoadMore={chat.canLoadMore}
          onLoadMore={chat.loadMore}
          fetching={chat.fetching}
          myId={myId}
          userSelect={userSelect}
          language={language}
          automaticallyAdjustKeyboardInsets={true}
          onScroll={header.onScroll}
          // under the header, and over the message field (and the keyboard while it is open)
          contentContainerStyle={{
            paddingTop: (keyboard.open ? (ios ? 190 : 380) : 200) + 10,
            paddingBottom: keyboard.open ? (ios ? 90 : 70) + 60 : 120
          }}
        />
      </View>
      <ChatInput value={chat.draft} onChange={chat.setDraft} onSend={chat.submit} keyboard={keyboard} />
    </View>
  )
}

const styles = StyleSheet.create({
  messages: { flex: 1 },
  screen: { zIndex: 1, top: 0, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: palette.white }
})

export default Chat
