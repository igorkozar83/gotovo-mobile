// ChatList.js
// The inbox CHAT tab: a row per conversation with the other person, its task, the last message's time
// and the unread count, in a list under the inbox's top (more loaded near its end). A row opens the
// conversation.
import React from "react"

import InboxChatMain from "./InboxChatMain"
import InboxListHeader, { INBOX_HEADER_HEIGHT } from "./InboxListHeader"
import CollapsingList from "../lists/CollapsingList"
import { dateDotTime } from "../../Helpers"
import { smallAvatar } from "../../Helpers/pictures"
import { palette } from "../../styles/palette"

// the other person of a conversation
export const chatPartner = (conversation, meId) => {
  if (conversation.first_user && conversation.first_user.id !== meId) return conversation.first_user
  if (conversation.second_user && conversation.second_user.id !== meId) return conversation.second_user
  return {}
}

const lastMessage = (conversation) => (conversation.messages && conversation.messages.length ? conversation.messages[0] : null)

/**
 * conversations, fetching, canLoadMore, onLoadMore: the list; onOpen(conversation): opens one
 * tab / onTab: the inbox bar
 */
const ChatList = ({ conversations, meId, language, onOpen, fetching, canLoadMore, onLoadMore, tab = "CHAT", onTab }) => (
  <CollapsingList
    header={<InboxListHeader tab={tab} onTab={onTab} />}
    headerHeight={INBOX_HEADER_HEIGHT}
    background={palette.white}
    fetching={fetching}
    canLoadMore={canLoadMore}
    onLoadMore={onLoadMore}
    data={conversations || []}
    extraData={[language, meId]}
    estimatedItemSize={110}
    keyExtractor={(conversation, index) => String(conversation.id ?? "convs-list-" + index)}
    renderItem={({ item: conversation }) => {
      const partner = chatPartner(conversation, meId)
      const last = lastMessage(conversation)
      return (
        <InboxChatMain
          workerImage={smallAvatar(partner)}
          date={last ? dateDotTime(last.created_at, language) : ""}
          chatFunction={() => onOpen(conversation)}
          msgSender={partner.full_name && partner.last_name ? partner.full_name + " " + partner.last_name.charAt(0) + "." : ""}
          numNotification={conversation.messages_count ? conversation.messages_count : null}
          task={conversation.task ? conversation.task.name : ""}
        />
      )
    }}
  />
)

export default ChatList
