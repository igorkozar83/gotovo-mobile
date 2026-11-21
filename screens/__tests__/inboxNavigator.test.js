// The inbox's tab navigator, with React Navigation itself: the route's params pick the tab, ask for fresh
// offers or chats, and reach the offers tab. (Each tab's own screen has its tests in flowScreens.)
import React from "react"
import { Text } from "react-native"
import { render, act } from "@testing-library/react-native"
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Notifications from "../Notifications"
import { useInboxParams } from "../inbox/InboxParams"
import { focusedScreenName } from "../../navigation/routes"

// the pager: its pages as plain views (no native pager in tests)
jest.mock("react-native-pager-view", () => {
  const React = require("react")
  const { View } = require("react-native")
  // (a class: the tab view animates it, which needs a component instance with a host view under it)
  class PagerView extends React.Component {
    setPage() {}
    setPageWithoutAnimation() {}
    setScrollEnabled() {}
    render() {
      return <View style={this.props.style}>{this.props.children}</View>
    }
  }
  return { __esModule: true, default: PagerView }
})
const mockInvalidate = { offers: jest.fn(), conversations: jest.fn() }
jest.mock("../../hooks/queries/useInbox", () => ({
  useInvalidateOffers: () => mockInvalidate.offers,
  useInvalidateConversations: () => mockInvalidate.conversations
}))
// each tab shows its name and the inbox params it reads
// (a function declaration: the hoisted jest.mock calls below run before any const is set)
function mockTab(name) {
  const Tab = () => {
    const params = require("../inbox/InboxParams").useInboxParams()
    const { Text: T } = require("react-native")
    return <T>{name + " " + JSON.stringify(params || {})}</T>
  }
  return { __esModule: true, default: Tab }
}
jest.mock("../inbox/InboxOffers", () => mockTab("InboxOffers"))
jest.mock("../inbox/InboxQuestions", () => mockTab("InboxQuestions"))
jest.mock("../inbox/InboxChats", () => mockTab("InboxChats"))
jest.mock("../inbox/InboxNotifications", () => mockTab("InboxNotifications"))

const Stack = createNativeStackNavigator()
const ref = createNavigationContainerRef()
const Other = () => <Text>other</Text>

const renderInbox = (params) =>
  render(
    <NavigationContainer ref={ref}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Notifications">
        <Stack.Screen name="Notifications" component={Notifications} initialParams={params} />
        <Stack.Screen name="Other" component={Other} />
      </Stack.Navigator>
    </NavigationContainer>
  )
const shown = () => focusedScreenName(ref.getRootState())

beforeEach(() => jest.clearAllMocks())

it("opens on the offers, or the tab the route asks for", async () => {
  await renderInbox()
  expect(shown()).toBe("InboxOffers")
  await act(async () => ref.navigate("Notifications", { qa: true }))
  expect(shown()).toBe("InboxQuestions")
  await act(async () => ref.navigate("Notifications", { tab: "CHAT" }))
  expect(shown()).toBe("InboxChats")
})

it("opened on a tab from the start", async () => {
  await renderInbox({ notifications: true })
  expect(shown()).toBe("InboxNotifications")
})

it("reloads what the route asks for; the offers tab reads the route (one task's offers)", async () => {
  const screen = await renderInbox()
  await act(async () => ref.navigate("Notifications", { refreshOffers: true, refreshConversations: true, viewOffers: true, taskDetailsId: 9 }))
  expect(mockInvalidate.offers).toHaveBeenCalled()
  expect(mockInvalidate.conversations).toHaveBeenCalled()
  expect(shown()).toBe("InboxOffers")
  expect(screen.getByText(/InboxOffers .*"taskDetailsId":9/)).toBeTruthy()
})

it("keeps its tab while another screen is on top", async () => {
  await renderInbox({ tab: "CHAT" })
  await act(async () => ref.navigate("Other"))
  await act(async () => ref.goBack())
  expect(shown()).toBe("InboxChats")
})

// (useInboxParams outside an inbox: nothing)
it("no inbox params outside the inbox", async () => {
  let params = "unset"
  const Probe = () => {
    params = useInboxParams()
    return null
  }
  await render(<Probe />)
  expect(params).toBeUndefined()
})
