// ChatMessages.js
// The conversation as a list that starts at its newest message: the note about agreeing things through
// the app on top, then the messages under the day they were sent. Older messages load as it is scrolled
// up (and the page before that as soon as one arrives while the reader is still near the top); a new one
// at the bottom stays in view while the reader is near it.
import React, { forwardRef, useEffect, useMemo, useRef } from "react"
import { View, Text, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"

import InboxChatMsg from "./InboxChatMsg"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { hourMin, timeFormatNoTime, shortenName } from "../../Helpers"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"
import useEvent from "../../hooks/useEvent"

// how near the top (px) the reader still wants the older messages
const NEAR_START = 400

// the rows of the list, oldest first: a day, then that day's messages
export const chatRows = (messages) => {
  const rows = []
  let day = null
  messages.forEach((message, index) => {
    const date = message.created_at.split("T")[0]
    if (date !== day) {
      day = date
      rows.push({ type: "day", key: "day-" + date, date })
    }
    rows.push({ type: "message", key: message.id != null ? "message-" + message.id : "message-at-" + index, message })
  })
  return rows
}

const ImportantNote = () => (
  <View style={styles.note}>
    <FastImageComponent style={styles.avatar} source={require("../../assets/chatexc.jpg")} />
    <View style={styles.column}>
      <Text style={[styles.noteText, atoms.fontSize16]}>{translate("chatMessages.importantNote")}</Text>
      <Text style={[styles.noteText, atoms.fontSize10]}>{translate("chatMessages.everythingYouAgreeThroughChatWith")}</Text>
    </View>
  </View>
)

/**
 * messages (oldest first), canLoadMore / onLoadMore / fetching: the conversation and its older pages
 * contentContainerStyle, onScroll and the rest go to the list; ref: the list (scrollToEnd)
 */
const ChatMessages = forwardRef(({ messages, myId, userSelect, language, canLoadMore, onLoadMore, fetching, onScroll, ...list }, ref) => {
  const color = userSelect === "CLIENT" ? palette.blue : palette.orange
  const rows = useMemo(() => chatRows(messages), [messages])

  // the list asks for the older page once as the top comes near: one asked for while a page was still
  // loading is lost, so a page that arrives with the reader near the top asks for the next
  const nearStart = useRef(false)
  const loadOlder = useEvent(() => {
    if (canLoadMore && !fetching && onLoadMore) onLoadMore()
  })
  useEffect(() => {
    if (!fetching && nearStart.current) loadOlder()
  }, [fetching, loadOlder])

  return (
    <FlashList
      ref={ref}
      bounces={false}
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      data={rows}
      extraData={[myId, language, color]}
      keyExtractor={(row) => row.key}
      getItemType={(row) => row.type}
      ListHeaderComponent={<ImportantNote />}
      maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.2 }}
      onStartReached={loadOlder}
      onScroll={(e) => {
        nearStart.current = e.nativeEvent.contentOffset.y < NEAR_START
        if (onScroll) onScroll(e)
      }}
      renderItem={({ item: row }) => {
        if (row.type === "day")
          return (
            <View style={styles.dateBlock}>
              <Text style={[styles.day, { color, borderBottomColor: color }]}>{timeFormatNoTime(row.date)}</Text>
            </View>
          )
        const message = row.message
        const mine = message.user_id === myId
        return (
          <InboxChatMsg
            workerImage={message.user.avatar}
            typeMsg={mine ? "send" : "receive"}
            sender={mine ? "" : shortenName(message.user.full_name) + message.user.last_name.charAt(0) + "."}
            chatMsg={message.message}
            time={hourMin(message.created_at, language)}
          />
        )
      }}
      {...list}
    />
  )
})

ChatMessages.displayName = "ChatMessages"

const styles = StyleSheet.create({
  column: { flexDirection: "column", width: "85%" },
  dateBlock: { paddingHorizontal: 22, paddingBottom: 10 },
  avatar: { width: 38, height: 38, marginRight: 16 },
  note: { flexDirection: "row", marginHorizontal: 22, marginBottom: 30, alignItems: "center" },
  noteText: { color: palette.gray600, fontFamily: "Montserrat_500Medium", flexShrink: 1, flexWrap: "wrap" },
  day: { width: "100%", justifyContent: "center", textAlign: "center", fontSize: 18, fontFamily: "Montserrat_600SemiBold", borderBottomWidth: 2 }
})

export default ChatMessages
