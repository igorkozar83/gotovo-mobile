// AppNavigator.js
// The screens: four tabs under the bottom bar (BottomNavigation), each a stack with its root and the
// screens it opens on top (routes.js; a signed-in user's own screens only while signed in). Each screen
// sits in its own error boundary and draws again when the texts change (withTexts). Android back closes the screen on top; on a tab's root it goes to Home
// (the first tab), where it asks before leaving.
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { withScreenBoundary } from "../components/ErrorBoundary"
import BottomNavigation from "../components/BottomNavigation"
import Home from "../screens/Home"
import PostTask from "../screens/PostTask"
import Notifications from "../screens/Notifications"
import Chat from "../screens/Chat"
import Profile from "../screens/Profile"
import TaskerProfile from "../screens/TaskerProfile"
import TaskOffer from "../screens/TaskOffer"
import MyTasks from "../screens/MyTasks"
import MyTaskFinished from "../screens/MyTaskFinished"
import MyTaskDetails from "../screens/MyTaskDetails"
import MyReviews from "../screens/MyReviews"
import Slider from "../screens/SliderPage"
import TermsAndConditions, { PrivacyPolicy, Faq } from "../screens/TermsAndConditions"
import TaskDetailsTasker from "../screens/TaskDetailsTasker"
import Contact from "../screens/Contact"
import IncomeAccounts from "../screens/IncomeAccounts"
import useAuthStore from "../stores/authStore"
import { createAppTabNavigator } from "./AppTabs"
import withTexts from "./withTexts"
import { TABS, stackScreens } from "./routes"

// route name -> title, screen
const SCREENS = Object.fromEntries(
  [
    ["Home", "Home", Home],
    ["PostTask", "Post A Task", PostTask],
    ["Notifications", "Notifications", Notifications],
    ["Chat", "Chat", Chat],
    ["Profile", "Profile", Profile],
    ["MyTasks", "My Tasks", MyTasks],
    ["MyTaskFinished", "My Task", MyTaskFinished],
    ["MyTaskDetails", "My Task", MyTaskDetails],
    ["TaskerProfile", "Tasker Profile", TaskerProfile],
    ["TaskOffer", "Task Offer", TaskOffer],
    ["TermsAndConditions", "Terms And Conditions", TermsAndConditions],
    ["PrivacyPolicy", "Privacy Policy", PrivacyPolicy],
    ["Faq", "Frequently Asked Questions", Faq],
    ["MyReviews", "My Reviews", MyReviews],
    ["Slider", "Sliders", Slider],
    ["TaskDetails", "Task-details", TaskDetailsTasker],
    ["Contact", "Contact & Support", Contact],
    ["IncomeAccounts", "Income Accounts", IncomeAccounts]
  ].map(([name, title, screen]) => [name, { title: "Gotovo - " + title, component: withScreenBoundary(withTexts(screen)) }])
)

const Tabs = createAppTabNavigator()
const Stack = createNativeStackNavigator()

// a tab's stack: its root first, then the shared screens
const tabStack = (root) => {
  const TabStack = () => {
    const signedIn = useAuthStore((state) => state.user.loggedIn)
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {stackScreens(root, signedIn).map((name) => (
          <Stack.Screen key={name} name={name} options={{ title: SCREENS[name].title }} component={SCREENS[name].component} />
        ))}
      </Stack.Navigator>
    )
  }
  TabStack.displayName = root + "Stack"
  return TabStack
}
const STACKS = Object.fromEntries(TABS.map(({ tab, root }) => [tab, tabStack(root)]))

const renderTabBar = (props) => <BottomNavigation {...props} />

export default function AppNavigator() {
  return (
    <Tabs.Navigator backBehavior="firstRoute" screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      {TABS.map(({ tab, root }) => (
        <Tabs.Screen key={tab} name={tab} options={{ title: SCREENS[root].title }} component={STACKS[tab]} />
      ))}
    </Tabs.Navigator>
  )
}
