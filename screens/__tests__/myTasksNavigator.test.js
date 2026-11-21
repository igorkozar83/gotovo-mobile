// The My Tasks tab navigator, with React Navigation itself: a navigation here picks the tab, opens a task
// over it, and the tab stays where it was left. (Each tab's own screen has its tests in flowScreens.)
import React from "react"
import { Text } from "react-native"
import { render, act } from "@testing-library/react-native"
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import MyTasks from "../MyTasks"
import { focusedScreenName } from "../../navigation/routes"
import useAuthStore from "../../stores/authStore"

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
const mockInvalidate = jest.fn()
jest.mock("../../hooks/queries/useMyTasks", () => ({ useInvalidateMyTasks: () => mockInvalidate }))
jest.mock("../../Services/live", () => ({ subscribe: jest.fn(() => () => {}) }))
jest.mock("../../components/modals/SubmitReviewPopup", () => () => null)
// (a function declaration: the hoisted jest.mock calls below run before any const is set)
function mockTab(name) {
  const Tab = () => {
    const { Text: T } = require("react-native")
    return <T>{name}</T>
  }
  return { __esModule: true, default: Tab }
}
jest.mock("../myTasks/MyTasksCurrent", () => mockTab("MyTasksCurrent"))
jest.mock("../myTasks/MyTasksFinished", () => mockTab("MyTasksFinished"))
jest.mock("../myTasks/MyTasksCalendar", () => mockTab("MyTasksCalendar"))

const Stack = createNativeStackNavigator()
const ref = createNavigationContainerRef()
const Details = () => <Text>details</Text>

const renderMyTasks = (params) =>
  render(
    <NavigationContainer ref={ref}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MyTasks">
        <Stack.Screen name="MyTasks" component={MyTasks} initialParams={params} />
        <Stack.Screen name="MyTaskDetails" component={Details} />
        <Stack.Screen name="MyTaskFinished" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  )
const shown = () => focusedScreenName(ref.getRootState())

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "CLIENT", channel: "ch6" } }, userSelect: "CLIENT" })
})

it("opens on the current tasks, or the finished ones when asked", async () => {
  await renderMyTasks()
  expect(shown()).toBe("MyTasksCurrent")
  await act(async () => ref.navigate("MyTasks", { type: "finished" }))
  expect(shown()).toBe("MyTasksFinished")
  await act(async () => ref.navigate("MyTasks", { refresh: true }))
  expect(shown()).toBe("MyTasksCurrent")
  expect(mockInvalidate).toHaveBeenCalledWith("CLIENT", false)
})

it("opened for a review to submit: the finished tab from the start", async () => {
  await renderMyTasks({ submitReview: { taskId: 9 } })
  expect(shown()).toBe("MyTasksFinished")
})

it("a finished task from a notification opens over the finished tab; back shows that tab", async () => {
  await renderMyTasks()
  await act(async () => ref.navigate("MyTasks", { taskdetailsFinished: 9 }))
  expect(shown()).toBe("MyTaskFinished")
  await act(async () => ref.goBack())
  expect(shown()).toBe("MyTasksFinished")
})
