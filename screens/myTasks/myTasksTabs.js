// myTasksTabs.js
// The My Tasks tabs: the key the tab bar shows (TabNavigation) and the route of each tab's screen in the
// My Tasks tab navigator (screens/MyTasks).

export const MY_TASKS_TABS = [
  { key: "CURRENTONE", route: "MyTasksCurrent" },
  { key: "FINISHED", route: "MyTasksFinished" },
  { key: "CALENDAR", route: "MyTasksCalendar" }
]

export const myTasksRoute = (key) => MY_TASKS_TABS.find((tab) => tab.key === key)?.route
