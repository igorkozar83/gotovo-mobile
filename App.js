// App.js
// The app's root: fonts first (the splash stays until then), the query cache, the screens and their tabs
// (navigation/AppNavigator), and Main with everything app-wide over them. App state lives in the Zustand
// stores (stores/).
import React, { useEffect } from "react"
import { Platform } from "react-native"
import { EventProvider } from "react-native-outside-press"
import * as NavigationBar from "expo-navigation-bar"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { QueryClientProvider } from "@tanstack/react-query"

import Main from "./components/Main"
import ErrorBoundary from "./components/ErrorBoundary"
import AppNavigator from "./navigation/AppNavigator"
import { navigationRef } from "./RootNavigation"
import { queryClient } from "./Services/queryClient"
import useAppFonts from "./hooks/useAppFonts"
import useUiStore from "./stores/uiStore"
import { initCrashReporting } from "./Services/crashReporting"

// the crash reporter first, so it sees errors from the first render on (off without a DSN)
initCrashReporting()

export default function App() {
  const fontsReady = useAppFonts()

  // Android: the system navigation bar stays hidden and comes back over the app on a swipe
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden")
      NavigationBar.setBehaviorAsync("overlay-swipe")
    }
  }, [])

  if (!fontsReady) return null

  return (
    <EventProvider style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef} onReady={() => useUiStore.getState().setNavigationReady(true)}>
          <ErrorBoundary onReset={() => navigationRef.navigate("Home")}>
            <AppNavigator />
            <Main />
          </ErrorBoundary>
          {Platform.OS !== "ios" ? <StatusBar style="dark" backgroundColor="#FFFFFF50" translucent={true} /> : <StatusBar style="light" hidden={false} />}
        </NavigationContainer>
      </QueryClientProvider>
    </EventProvider>
  )
}
