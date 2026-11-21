// The tabs and their stacks, with React Navigation itself: navigating by a screen's name finds its tab,
// and a tab keeps its place while another one is in front.
import React from "react"
import { Text, Pressable } from "react-native"
import { render, screen, act, fireEvent } from "@testing-library/react-native"
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { createAppTabNavigator, toTabAction } from "../AppTabs"
import { TABS, SHARED_SCREENS, MEMBER_SCREENS, stackScreens, focusedScreenName } from "../routes"
import { navigationRef, resetToHome } from "../../RootNavigation"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import withTexts from "../withTexts"

describe("toTabAction", () => {
  const state = { index: 1, routeNames: TABS.map(({ tab }) => tab), routes: TABS.map(({ tab }) => ({ name: tab, key: tab })) }
  const navigate = (name, params) => ({ type: "NAVIGATE", payload: { name, params } })

  it("a tab's root goes to its tab, with the params for the root", () => {
    expect(toTabAction(state, navigate("MyTasks", { refresh: true }))).toEqual(navigate("MyTasksTab", { screen: "MyTasks", params: { refresh: true } }))
  })

  it("any other screen opens on top of the tab in front, over its root", () => {
    expect(toTabAction(state, navigate("Chat", { conversation: 1 }))).toEqual(navigate("InboxTab", { screen: "Chat", params: { conversation: 1 }, initial: false }))
  })

  it("leaves the tabs themselves, unknown names and other actions alone", () => {
    expect(toTabAction(state, navigate("HomeTab"))).toEqual(navigate("HomeTab"))
    expect(toTabAction(state, navigate("Nowhere"))).toEqual(navigate("Nowhere"))
    const goBack = { type: "GO_BACK" }
    expect(toTabAction(state, goBack)).toBe(goBack)
  })
})

describe("focusedScreenName", () => {
  it("follows the tab in front down to its top screen; a tab not built yet shows its root or the screen asked for", () => {
    const tabs = (route) => ({ index: 0, routes: [route] })
    expect(focusedScreenName(tabs({ name: "InboxTab", state: { index: 1, routes: [{ name: "Notifications" }, { name: "Chat" }] } }))).toBe("Chat")
    expect(focusedScreenName(tabs({ name: "MyTasksTab" }))).toBe("MyTasks")
    expect(focusedScreenName(tabs({ name: "HomeTab", params: { screen: "PostTask" } }))).toBe("PostTask")
  })
})

describe("the tab navigator", () => {
  const Tabs = createAppTabNavigator()
  const Stack = createNativeStackNavigator()
  const ref = createNavigationContainerRef()

  // every screen shows its name and params, and can navigate
  const Screen = ({ route, navigation }) => (
    <>
      <Text>{"on " + route.name + " " + JSON.stringify(route.params || {})}</Text>
      <Pressable accessibilityLabel="to MyTasks" onPress={() => navigation.navigate("MyTasks", { refresh: true })} />
      <Pressable accessibilityLabel="to Chat" onPress={() => navigation.navigate("Chat", { conversation: 7 })} />
      <Pressable accessibilityLabel="back" onPress={() => navigation.goBack()} />
    </>
  )
  const stack = (root) => {
    const TabStack = () => (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {[root, ...SHARED_SCREENS].map((name) => (
          <Stack.Screen key={name} name={name} component={Screen} />
        ))}
      </Stack.Navigator>
    )
    return TabStack
  }
  const STACKS = Object.fromEntries(TABS.map(({ tab, root }) => [tab, stack(root)]))

  const renderTabs = () =>
    render(
      <NavigationContainer ref={ref}>
        <Tabs.Navigator backBehavior="history" screenOptions={{ headerShown: false }} tabBar={() => null}>
          {TABS.map(({ tab }) => (
            <Tabs.Screen key={tab} name={tab} component={STACKS[tab]} />
          ))}
        </Tabs.Navigator>
      </NavigationContainer>
    )
  const press = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
  const shown = () => focusedScreenName(ref.getRootState())

  it("a tab's root, from another tab's screen: that tab, its root with the params", async () => {
    await renderTabs()
    await press("to MyTasks")
    expect(shown()).toBe("MyTasks")
    expect(ref.getCurrentRoute().params).toEqual({ refresh: true })
  })

  it("a screen opens on top of the tab in front, and the tab keeps it while another is in front", async () => {
    await renderTabs()
    await act(async () => ref.navigate("Notifications"))
    await press("to Chat")
    expect(shown()).toBe("Chat")
    expect(ref.getCurrentRoute().params).toEqual({ conversation: 7 })
    await act(async () => ref.navigate("HomeTab"))
    expect(shown()).toBe("Home")
    await act(async () => ref.navigate("InboxTab"))
    expect(shown()).toBe("Chat")
    await press("back")
    expect(shown()).toBe("Notifications")
  })

  it("from outside the screens (a push): over the tab in front, with its root under it", async () => {
    await renderTabs()
    await act(async () => ref.navigate("TaskOffer", { id: 3 }))
    expect(shown()).toBe("TaskOffer")
    expect(ref.getRootState().routes[ref.getRootState().index].name).toBe("HomeTab")
    await press("back")
    expect(shown()).toBe("Home")
  })

  it("a tab's root while a screen is on top of it goes back to the root, with the new params", async () => {
    await renderTabs()
    await act(async () => ref.navigate("MyTasks"))
    await press("to Chat")
    await act(async () => ref.navigate("MyTasks", { tab: "FINISHED" }))
    expect(shown()).toBe("MyTasks")
    expect(ref.getCurrentRoute().params).toEqual({ tab: "FINISHED" })
  })
})

describe("a signed-in user's own screens", () => {
  const Tabs = createAppTabNavigator()
  const Stack = createNativeStackNavigator()
  // each screen counts its draws from scratch (withTexts mounts it anew on new texts)
  let mounts = 0
  const Plain = ({ route }) => {
    const [mount] = React.useState(() => ++mounts)
    return <Text>{"on " + route.name + " #" + mount}</Text>
  }
  const Screen = withTexts(Plain)
  const stack = (root) => {
    const TabStack = () => {
      const signedIn = useAuthStore((state) => state.user.loggedIn)
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {stackScreens(root, signedIn).map((name) => (
            <Stack.Screen key={name} name={name} component={Screen} />
          ))}
        </Stack.Navigator>
      )
    }
    return TabStack
  }
  const STACKS = Object.fromEntries(TABS.map(({ tab, root }) => [tab, stack(root)]))
  const renderApp = () =>
    render(
      <NavigationContainer ref={navigationRef}>
        <Tabs.Navigator backBehavior="firstRoute" screenOptions={{ headerShown: false }} tabBar={() => null}>
          {TABS.map(({ tab }) => (
            <Tabs.Screen key={tab} name={tab} component={STACKS[tab]} />
          ))}
        </Tabs.Navigator>
      </NavigationContainer>
    )
  const shown = () => focusedScreenName(navigationRef.getRootState())

  beforeEach(() => {
    // React Navigation says so when nothing handles a navigation (a guest's to a member screen)
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  it("a guest's stacks have no member screens; the public ones stay", () => {
    expect(stackScreens("Home", false)).toEqual(["Home", ...SHARED_SCREENS.filter((name) => !MEMBER_SCREENS.includes(name))])
    expect(stackScreens("Home", false)).toContain("PostTask")
    expect(stackScreens("Home", true)).toEqual(["Home", ...SHARED_SCREENS])
  })

  it("signing out closes them and starts from Home; a guest cannot open them", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6 } } })
    await renderApp()
    await act(async () => navigationRef.navigate("Notifications"))
    await act(async () => navigationRef.navigate("Chat", { conversation: 7 }))
    expect(shown()).toBe("Chat")

    await act(async () => {
      resetToHome()
      useAuthStore.setState({ user: { loggedIn: false, userData: { reviews: [] } } })
    })
    expect(shown()).toBe("Home")
    await act(async () => navigationRef.navigate("InboxTab"))
    expect(shown()).toBe("Notifications")

    await act(async () => navigationRef.navigate("MyTaskDetails", { taskId: 3 }))
    expect(shown()).toBe("Notifications")
    await act(async () => navigationRef.navigate("PostTask"))
    expect(shown()).toBe("PostTask")
  })

  it("new texts draw the screens again where the user is", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6 } } })
    await renderApp()
    await act(async () => navigationRef.navigate("Notifications"))
    await act(async () => navigationRef.navigate("Chat", { conversation: 7 }))
    const chatBefore = screen.getByText(/^on Chat #/).props.children
    await act(async () => useUiStore.setState({ language: "SR", textsVersion: 1 }))
    expect(shown()).toBe("Chat")
    expect(navigationRef.getCurrentRoute().params).toEqual({ conversation: 7 })
    // drawn anew, with the new texts
    expect(screen.getByText(/^on Chat #/).props.children).not.toBe(chatBefore)
  })
})
