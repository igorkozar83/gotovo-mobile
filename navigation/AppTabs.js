// AppTabs.js
// The bottom tab navigator, with one difference from React Navigation's: navigating by a screen's name
// finds its tab. A tab's root ("MyTasks") switches to that tab and shows its root with the params; any
// other screen ("Chat", "TaskOffer") opens on top of the tab in front. Code (and the push handlers)
// keep navigating by screen name, without knowing which tab a screen lives in.
import React from "react"
import { createNavigatorFactory, useNavigationBuilder, TabRouter } from "@react-navigation/native"
import { BottomTabView } from "@react-navigation/bottom-tabs"

import { TAB_OF_ROOT, SHARED_SCREENS } from "./routes"

// the NAVIGATE action, pointed at the tab that holds its screen; any other action as it is
export const toTabAction = (state, action) => {
  if (action.type !== "NAVIGATE" || !action.payload || state.routeNames.includes(action.payload.name)) return action
  const { name, params, ...rest } = action.payload
  if (TAB_OF_ROOT[name]) return { ...action, payload: { ...rest, name: TAB_OF_ROOT[name], params: { screen: name, params } } }
  // (initial: false keeps the tab's root under the screen when the tab's stack is built for it)
  if (SHARED_SCREENS.includes(name)) return { ...action, payload: { ...rest, name: state.routes[state.index].name, params: { screen: name, params, initial: false } } }
  return action
}

export const AppTabRouter = (options) => {
  const router = TabRouter(options)
  return {
    ...router,
    getStateForAction: (state, action, config) => router.getStateForAction(state, toTabAction(state, action), config)
  }
}

// React Navigation's createBottomTabNavigator, on AppTabRouter
const AppTabNavigator = ({ id, initialRouteName, backBehavior, children, screenListeners, screenOptions, sceneContainerStyle, ...rest }) => {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder(AppTabRouter, {
    id,
    initialRouteName,
    backBehavior,
    children,
    screenListeners,
    screenOptions
  })

  return (
    <NavigationContent>
      <BottomTabView {...rest} state={state} navigation={navigation} descriptors={descriptors} sceneContainerStyle={sceneContainerStyle} />
    </NavigationContent>
  )
}

export const createAppTabNavigator = createNavigatorFactory(AppTabNavigator)
