// Notifications.js
// The inbox: a tab navigator of its four tabs (screens/inbox: offers, questions, chats, notifications),
// one screen each, swiped or chosen on the inbox bar each of them draws (with the hero, it slides or
// scrolls with the tab). The route's params pick the tab (inboxTabs) and ask for fresh offers or chats;
// the offers tab also reads them (InboxParams).
import React, { useLayoutEffect } from "react"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import ActivityInd from "../components/ui/ActivityInd"
import InboxOffers from "./inbox/InboxOffers"
import InboxQuestions from "./inbox/InboxQuestions"
import InboxChats from "./inbox/InboxChats"
import InboxNotifications from "./inbox/InboxNotifications"
import { InboxParamsContext } from "./inbox/InboxParams"
import { INBOX_TABS, inboxRoute, requestedInboxTab } from "./inbox/inboxTabs"
import { useInvalidateOffers, useInvalidateConversations } from "../hooks/queries/useInbox"

const Top = createMaterialTopTabNavigator()

const SCREENS = { InboxOffers, InboxQuestions, InboxChats, InboxNotifications }

const hideTabBar = () => null

export default function Notifications({ route, navigation }) {
  const params = route.params
  const invalidateOffers = useInvalidateOffers()
  const invalidateConversations = useInvalidateConversations()

  // each navigation to the inbox: what it asks to reload, and the tab it asks for
  useLayoutEffect(() => {
    if (!params) return
    if (params.refreshOffers) invalidateOffers()
    if (params.refreshConversations) invalidateConversations()
    const tab = requestedInboxTab(params)
    if (tab) navigation.navigate(inboxRoute(tab))
  }, [params, navigation, invalidateOffers, invalidateConversations])

  return (
    <InboxParamsContext.Provider value={params}>
      <ActivityInd />
      <Top.Navigator tabBar={hideTabBar} initialRouteName={inboxRoute(requestedInboxTab(params) || "OFFERS")} backBehavior="none" screenOptions={{ lazy: true }}>
        {INBOX_TABS.map(({ route: name }) => (
          <Top.Screen key={name} name={name} component={SCREENS[name]} />
        ))}
      </Top.Navigator>
    </InboxParamsContext.Provider>
  )
}
