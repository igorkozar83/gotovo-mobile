// BottomNavigation.js
// The tab navigator's bar (navigation/AppNavigator): home, inbox (with the unread count), post a task
// (clients), my tasks and profile, in the role's colours. A tab shows its stack where it was left; pressing
// the tab in front goes back to its root. Logged out, the inbox and tasks are dimmed and the profile asks
// to log in; an unverified tasker's inbox and tasks are dimmed and explain why. The bar hides while the
// keyboard is up and on the screens shown without it, and slides down while the side menu is open.
import React, { useEffect, useRef } from "react"
import { View, Text, Pressable, Animated, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

import FastImageComponent from "./media/FastImageComponent.js"
import CountBadge from "./ui/CountBadge"
import useKeyboardVisible from "../hooks/useKeyboardVisible"
import useUnverifiedTasker from "../hooks/useUnverifiedTasker"
import useAuthStore from "../stores/authStore"
import useUiStore, { textsKey } from "../stores/uiStore"
import { useInboxCount } from "../hooks/queries/useInboxCount"
import { translate } from "../Helpers/language.utils"
import { TAB_OF_ROOT, BARLESS_SCREENS, focusedScreenName } from "../navigation/routes"

import styles from "../styles/BottomNavigation.style.js"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

// per tab: the icon, and the active one per role
const ICONS = {
  Home: { idle: require("../assets/homebtn.png"), CLIENT: require("../assets/homebtnblue.png"), TASKER: require("../assets/homeorange.png") },
  Notifications: { idle: require("../assets/bottomnavchat.png"), CLIENT: require("../assets/bottomnavchatblue.png"), TASKER: require("../assets/inboxorange.png") },
  MyTasks: { idle: require("../assets/mytasks.png"), CLIENT: require("../assets/mytasksblue.png"), TASKER: require("../assets/mytasksorange.png") },
  Profile: { idle: require("../assets/profile.png"), CLIENT: require("../assets/profileblue.png"), TASKER: require("../assets/profileorange.png") }
}

// A label of two words breaks into two lines at its own size ("MOJI / ZADACI"), never shrinks: a shrunk one was
// too small, and Android kept the shrink of the other role's layout after a switch ("MOJI"). One word stays on
// one line, made smaller only if it must (a bold "POČETNA" broke into "POČETN / A"). A large system font grows
// a label only so far, so it stays inside the bar.
const LABEL_MAX_SCALE = 1.2

export const BarLabel = ({ text, style }) => {
  const oneWord = !text.trim().includes(" ")
  return (
    <Text numberOfLines={oneWord ? 1 : 2} adjustsFontSizeToFit={oneWord} maxFontSizeMultiplier={LABEL_MAX_SCALE} style={style}>
      {text}
    </Text>
  )
}

// a tab; without onPress it is shown dimmed and does nothing. iconWidth: the icon is 16 high, as wide as its
// picture's own shape (contain: never cut)
const NavTab = ({ screen, label, role, active, onPress, faded, iconWidth = 16, textStyle, children }) => {
  const content = (
    <>
      <FastImageComponent contentFit="contain" style={{ ...styles.image, height: 16, width: iconWidth }} source={active ? ICONS[screen][role] : ICONS[screen].idle} />
      <BarLabel text={translate(label)} style={[styles.buttonText, textStyle, { fontFamily: active ? "Montserrat_700Bold" : "Montserrat_400Regular" }]} />
      {children}
    </>
  )
  if (!onPress) return <View style={[styles.styleButton, atoms.opacity0_4, screen === "MyTasks" && { paddingHorizontal: 4 }]}>{content}</View>
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate(label)}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[styles.styleButton, screen === "MyTasks" && { paddingHorizontal: 4 }, faded && { opacity: 0.3 }]}
    >
      {content}
    </Pressable>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  bar: { paddingTop: 0, height: 60, position: "relative", zIndex: 999 }
})

// state / navigation: the tab navigator's (its tabBar props)
export default function BottomNavigation({ state, navigation }) {
  // drawn again with new texts
  useUiStore(textsKey)
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const role = useAuthStore((state) => state.userSelect) === "CLIENT" ? "CLIENT" : "TASKER"
  const headerMenuOpen = useUiStore((state) => state.headerMenuOpen)
  const countInbox = useInboxCount()
  const unverified = useUnverifiedTasker()
  const keyboardVisible = useKeyboardVisible()

  // slides down while the side menu is open
  const translateY = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(translateY, { toValue: headerMenuOpen ? 75 : 0, duration: 500, useNativeDriver: true }).start()
  }, [headerMenuOpen, translateY])

  const shown = focusedScreenName(state)
  const frontTab = state.routes[state.index].name
  const postingTask = shown === "PostTask"

  // to a tab, where it was left (the tab in front: its stack goes back to its root, on the tabPress event)
  const go = (screen) => () => {
    const tabRoute = state.routes.find((route) => route.name === TAB_OF_ROOT[screen])
    const event = navigation.emit({ type: "tabPress", target: tabRoute.key, canPreventDefault: true })
    if (!event.defaultPrevented) navigation.navigate(tabRoute.name)
  }
  const guarded = (screen) => () => (unverified.locked ? unverified.explain() : go(screen)())
  const postTask = () => {
    useUiStore.getState().setSelectedJobId(null)
    navigation.navigate("PostTask")
  }
  // the tab in front is lit, unless a task is being posted (then "POST A TASK" is)
  const isActive = (screen) => !postingTask && frontTab === TAB_OF_ROOT[screen]
  const tab = (screen) => ({ screen, role, active: isActive(screen) })

  if (keyboardVisible || BARLESS_SCREENS.includes(shown)) return null

  return (
    <SafeAreaView edges={["bottom"]} style={local.bar}>
      <Animated.View style={[styles.bottomNav, { transform: [{ translateY }] }]}>
        <LinearGradient colors={[palette.slateClear, palette.slateShadowLight]} style={styles.topBorder}></LinearGradient>
        <View style={role === "CLIENT" ? styles.main : { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingHorizontal: 20 }}>
          <NavTab {...tab("Home")} label={"common.home"} onPress={go("Home")} />
          <NavTab
            {...tab("Notifications")}
            active={loggedIn && isActive("Notifications")}
            label={"bottomNavigation.inbox"}
            onPress={loggedIn ? guarded("Notifications") : null}
            faded={unverified.locked}
          >
            {loggedIn && countInbox.total ? <CountBadge count={countInbox.total} style={[styles.notif, isActive("Notifications") && { backgroundColor: palette.black }]} /> : null}
          </NavTab>
          {role === "CLIENT" ? (
            <>
              <Pressable onPress={postTask} style={[styles.styleButton, atoms.flex0_3]}>
                <Text
                  numberOfLines={2}
                  maxFontSizeMultiplier={LABEL_MAX_SCALE}
                  style={[styles.buttonText, { top: 8, zIndex: 50, fontFamily: postingTask ? "Montserrat_700Bold" : "Montserrat_400Regular" }]}
                >
                  {translate("bottomNavigation.postATask")}
                </Text>
              </Pressable>
              <View style={styles.plusIcon}>
                <Pressable accessibilityRole="button" accessibilityLabel={translate("bottomNavigation.postATask")} onPress={postTask}>
                  <FastImageComponent style={styles.image} source={require("../assets/postatask.png")} />
                </Pressable>
              </View>
            </>
          ) : null}
          <NavTab
            {...tab("MyTasks")}
            active={loggedIn && isActive("MyTasks")}
            label={"bottomNavigation.myTasks"}
            iconWidth={22}
            textStyle={styles.buttonTextMyTasks}
            onPress={loggedIn ? guarded("MyTasks") : null}
            faded={unverified.locked}
          />
          <NavTab
            {...tab("Profile")}
            active={loggedIn && isActive("Profile")}
            label={"bottomNavigation.profile"}
            iconWidth={18}
            onPress={loggedIn ? go("Profile") : () => useUiStore.getState().setAuthOpen(true)}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}
