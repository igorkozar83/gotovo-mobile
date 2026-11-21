// inboxTabs.js
// The inbox's four tabs: the key the inbox bar shows (NavBar) and the route of each tab's screen in the
// inbox's tab navigator (screens/Notifications). Also which tab a route asks for: callers navigate to
// "Notifications" with { tab } or the older flags (viewOffers, openChat, qa, notifications).

export const INBOX_TABS = [
  { key: "OFFERS", route: "InboxOffers" },
  { key: "QA", route: "InboxQuestions" },
  { key: "CHAT", route: "InboxChats" },
  { key: "NOTIFICATIONS", route: "InboxNotifications" }
]

export const inboxRoute = (key) => INBOX_TABS.find((tab) => tab.key === key)?.route

// the tab the route's params ask for, or undefined
export const requestedInboxTab = (params) => {
  if (!params) return undefined
  if (params.tab) return params.tab
  if (params.viewOffers) return "OFFERS"
  if (params.openChat) return "CHAT"
  if (params.qa) return "QA"
  if (params.notifications) return "NOTIFICATIONS"
  return undefined
}
