// InboxListHeader.js
// The top of the inbox's lists (questions, chats, notifications): the hero and the inbox bar, sliding
// away as the list scrolls (CollapsingList, headerHeight INBOX_HEADER_HEIGHT).
import React from "react"

import NavBar from "./NavBar"
import NotificationHeroSection from "./NotificationHeroSection"

export const INBOX_HEADER_HEIGHT = 192

// tab / onTab: the inbox bar
const InboxListHeader = ({ tab, onTab }) => (
  <>
    <NotificationHeroSection />
    <NavBar tab={tab} onTab={onTab} />
  </>
)

export default InboxListHeader
