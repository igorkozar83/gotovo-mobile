// routes.js
// The app's routes. The bottom bar has four tabs, each a stack with its own root screen; the other screens
// open on top of whichever tab is shown, so a tab keeps its place while another one is in front.
// Code navigates by screen name ("MyTasks", "Chat"): AppTabs turns that into the right tab.

export const TABS = [
  { tab: "HomeTab", root: "Home" },
  { tab: "InboxTab", root: "Notifications" },
  { tab: "MyTasksTab", root: "MyTasks" },
  { tab: "ProfileTab", root: "Profile" }
]

// a tab's root screen -> its tab
export const TAB_OF_ROOT = Object.fromEntries(TABS.map(({ tab, root }) => [root, tab]))

// the screens any tab can open on top of its root
export const SHARED_SCREENS = [
  "PostTask",
  "Chat",
  "TaskerProfile",
  "TaskOffer",
  "MyTaskFinished",
  "MyTaskDetails",
  "MyReviews",
  "Slider",
  "TermsAndConditions",
  "PrivacyPolicy",
  "Faq",
  "TaskDetails",
  "Contact",
  "IncomeAccounts"
]

// the screens only a signed-in user has (their conversations, offers, tasks, reviews and accounts): they
// exist only while someone is signed in, so nothing opens them for a guest and signing out closes them
export const MEMBER_SCREENS = ["Chat", "TaskOffer", "MyTaskFinished", "MyTaskDetails", "MyReviews", "IncomeAccounts"]

// a tab's stack: its root, then the shared screens the user may open
export const stackScreens = (root, signedIn) => [root, ...SHARED_SCREENS.filter((name) => signedIn || !MEMBER_SCREENS.includes(name))]

// the screens shown without the bottom bar
export const BARLESS_SCREENS = ["MyTaskDetails", "MyTaskFinished"]

// the name of the screen in front, followed down through the nested navigators; a tab whose stack
// is not built yet shows the screen its params ask for, or its root
export const focusedScreenName = (state) => {
  if (!state) return undefined
  const route = state.routes[state.index ?? 0]
  if (route.state) return focusedScreenName(route.state)
  const root = TABS.find(({ tab }) => tab === route.name)?.root
  return route.params?.screen ?? root ?? route.name
}
