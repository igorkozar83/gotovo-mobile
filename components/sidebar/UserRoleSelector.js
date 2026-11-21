// UserRoleSelector.js
// "I am a: CLIENT / TASKER". Choosing tasker shows the tasker introduction the first time, and asks a
// logged-out user to log in.
import React from "react"
import { View, Pressable, Text, StyleSheet } from "react-native"

import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { showTaskerIntroOnce } from "../../hooks/main/taskerIntro"
import { navigationRef } from "../../RootNavigation"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Sidebar.style"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// "I am a:" over the chosen role, an empty line over the other (both names on one line), underlined when chosen.
// The space around the name is the box's, in points: a percentage on the text itself was taken off the width
// the text was measured for, so "TASKER" was cut to "TASKE…".
const RoleTab = ({ role, active, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
    <View style={[local.tab, active && local.chosen]}>
      <Text style={[styles.userLinkActive, atoms.fontFamilyMontserrat700Bold]} numberOfLines={1}>
        {active ? translate("userRoleSelector.iAmA") : " "}
      </Text>
      <Text style={active ? styles.userLinkActive : styles.userLink} numberOfLines={1}>
        {translate(role)}
      </Text>
    </View>
  </Pressable>
)

// the user switches role: a signed-in one starts over on Home in it, the menu closed (useRoleSync saves it)
const chooseRole = (role) => {
  const { userSelect, setUserSelect, user } = useAuthStore.getState()
  if (role === userSelect) return
  setUserSelect(role)
  if (!user.loggedIn) return
  if (navigationRef.isReady()) navigationRef.navigate("Home")
  useUiStore.getState().setHeaderMenuOpen(false)
}

const UserRoleSelector = () => {
  const userSelect = useAuthStore((state) => state.userSelect)

  return (
    <View style={styles.choseUser}>
      <View style={styles.flexColumn}>
        <RoleTab role="CLIENT" active={userSelect === "CLIENT"} onPress={() => chooseRole("CLIENT")} />
      </View>
      <RoleTab
        role="TASKER"
        active={userSelect === "TASKER"}
        onPress={() => {
          showTaskerIntroOnce()
          chooseRole("TASKER")
          if (!useAuthStore.getState().user.loggedIn) useUiStore.getState().setAuthOpen(true)
        }}
      />
    </View>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  tab: { alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: palette.transparent },
  chosen: { borderBottomColor: palette.white }
})

export default UserRoleSelector
