// navigation.js
// React Navigation for component and screen tests, without a navigator: one navigation object whose
// calls a test checks, the route a test sets, and a screen that is always focused.
//   jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
import { useEffect } from "react"

export const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  openDrawer: jest.fn(),
  closeDrawer: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn())
}

export const route = { name: "Test", params: {} }

// the route the next render reads (name, params)
export const setRoute = (fields) => Object.assign(route, { name: "Test", params: {} }, fields)

export const navigationMock = {
  useNavigation: () => navigation,
  useRoute: () => route,
  useIsFocused: () => true,
  // the screen is focused from its mount on: the effect runs then, and again when the callback changes
  // (as React Navigation's does while the screen is focused; screens pass a useCallback)
  useFocusEffect: (effect) => useEffect(effect, [effect]),
  NavigationContainer: ({ children }) => children,
  // the app's container ref (RootNavigation): ready, its calls on the same navigation object
  createNavigationContainerRef: () => ({ ...navigation, isReady: () => true })
}
