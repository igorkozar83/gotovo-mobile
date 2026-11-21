// Sidebar.js
// The side menu: languages, the user (or login / register), the role, the links and logout. It slides in
// from the right over a faded backdrop; tapping outside closes it.
import React, { useState } from "react"
import { View, Text, Pressable, Animated, Platform, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { SimpleLineIcons } from "@expo/vector-icons"

import CloseButtonAndLanguageSelector from "./CloseButtonAndLanguageSelector"
import AvatarBlock from "./AvatarBlock"
import SidebarLoginRegister from "./SidebarLoginRegister"
import UserRoleSelector from "./UserRoleSelector"
import SidebarMainMenu from "./SidebarMainMenu"
import SidebarMoreMenu from "./SidebarMoreMenu"
import UserBadges from "../profile/UserBadges"
import useSidebarMenu from "../../hooks/sidebar/useSidebarMenu"
import useUnverifiedTasker from "../../hooks/useUnverifiedTasker"
import useSession from "../../hooks/auth/useSession"
import useAuthStore from "../../stores/authStore"
import useUiStore, { textsKey } from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Sidebar.style"
import { useServerLogout } from "../../hooks/auth/useAccountActions"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const GLOWS = { CLIENT: [palette.blueDarkClear, palette.blue], TASKER: [palette.orangeDarkClear, palette.orange] }

const Sidebar = () => {
  // drawn again with new texts
  useUiStore(textsKey)
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.userSelect) === "CLIENT" ? "CLIENT" : "TASKER"
  const menu = useSidebarMenu()
  const [list, setList] = useState("MAIN")
  const { signOutLocally } = useSession()

  const go = (screen, params) => {
    navigation.navigate(screen, params)
    menu.close()
  }

  // an unverified tasker is sent to the licences in their profile
  const unverified = useUnverifiedTasker()
  const explainUnverified = () => unverified.explain(menu.close)

  // logs out on this device even when the server could not be reached (the token is dropped either way)
  const serverLogout = useServerLogout({ onDone: signOutLocally })

  if (!menu.shown) return null

  return (
    <View style={local.container}>
      <Animated.View style={{ ...styles.mask, opacity: menu.opacity }}></Animated.View>
      <Animated.View style={{ ...styles.mainMenu, transform: [{ translateX: menu.translateX }], backgroundColor: role === "CLIENT" ? palette.blueDark : palette.orangeBurnt }}>
        <LinearGradient colors={[palette.slateClear, palette.slateShadow]} start={[0, 0]} end={[1, 0]} style={[local.edgeShadow, styles.shadow]}></LinearGradient>
        <CloseButtonAndLanguageSelector onClose={menu.toggle} />
        <View style={atoms.marginTop70}>
          <LinearGradient style={local.glow} colors={GLOWS[role]} />
          <AvatarBlock onOpenProfile={() => go("Profile")} />
          <View style={atoms.marginBottom20}>
            {!user.loggedIn ? (
              <SidebarLoginRegister onClose={menu.close} />
            ) : (
              <Pressable onPress={() => go("Profile")}>
                <Text style={[styles.topText, local.intro]} ellipsizeMode="tail" numberOfLines={1}>
                  {user.userData.name} {user.userData.last_name}
                </Text>
                <UserBadges user={user.userData} role={role} count={user.userData.tasks_count} variant="compact" style={local.badges} />
              </Pressable>
            )}
          </View>
          <UserRoleSelector />
        </View>
        <LinearGradient colors={GLOWS.CLIENT} style={styles.topMenuPart}></LinearGradient>
        {list === "MAIN" ? <SidebarMainMenu go={go} onUnverified={explainUnverified} onMore={() => setList("MORE")} /> : <SidebarMoreMenu go={go} onBack={() => setList("MAIN")} />}
        <View style={[styles.bottomMenuPart, { bottom: Platform.OS === "ios" ? 30 : 10 }]}>
          <View style={styles.lineSpecial}></View>
          <Pressable
            style={styles.button}
            onPress={() => {
              menu.close()
              if (user.loggedIn) serverLogout.run()
              else useUiStore.getState().setAuthOpen(true)
            }}
          >
            <Text style={styles.posMenuIcon}>
              <SimpleLineIcons name="logout" size={16} color={palette.white} />
            </Text>
            <Text style={styles.btnText}>{translate(user.loggedIn ? "sidebar.logout" : "common.login")}</Text>
          </Pressable>
        </View>
      </Animated.View>
      <Pressable accessibilityRole="button" accessibilityLabel={translate("common.close")} style={local.backdrop} onPress={menu.close}></Pressable>
    </View>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  intro: { marginBottom: 20, maxWidth: 220 },
  container: { backgroundColor: palette.whiteClear, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  edgeShadow: { position: "absolute", left: -10, top: 0, bottom: 0, width: 10 },
  glow: { width: "100%", height: "100%", borderBottomColor: palette.white, borderBottomWidth: 1, position: "absolute" },
  badges: { flexDirection: "row", paddingLeft: 35, flexWrap: "wrap" },
  backdrop: { backgroundColor: palette.transparent, width: "100%", height: "100%", zIndex: 203 }
})

export default Sidebar
