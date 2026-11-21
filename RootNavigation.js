// RootNavigation.js
// The navigation container's ref (App), for code outside the screens.
import { createNavigationContainerRef } from "@react-navigation/native"

import { TABS } from "./navigation/routes"

export const navigationRef = createNavigationContainerRef()

// the app as it starts: Home in front and every tab back at its root (a session that ended leaves none
// of its screens open behind the tabs)
export const resetToHome = () => {
  if (navigationRef.isReady()) navigationRef.reset({ index: 0, routes: TABS.map(({ tab }) => ({ name: tab })) })
}
