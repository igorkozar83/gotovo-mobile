// SidebarMainMenu.js
// The side menu's main links. An unverified tasker's inbox and tasks are dimmed and explain why.
import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import SidebarLinkItem from "./SidebarLinkItem"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { useInboxCount } from "../../hooks/queries/useInboxCount"
import { translate } from "../../Helpers/language.utils"
import { FEATURES } from "../../Helpers/features"

import styles from "../../styles/Sidebar.style"
import { palette } from "../../styles/palette"

// rating the app has no screen yet: tapping does nothing
const NOT_BUILT_YET = () => {}

// go(screen, params): navigates and closes the menu; onUnverified: explains a locked link; onMore: the "More" list
const SidebarMainMenu = ({ go, onUnverified, onMore }) => {
  const user = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const countInbox = useInboxCount()
  const locked = userSelect === "TASKER" && !user.userData?.verifications?.verified_tasker
  const guarded = (screen) => () => (locked ? onUnverified() : go(screen))

  return (
    <View style={styles.topMenu}>
      {userSelect === "CLIENT" ? (
        <SidebarLinkItem
          label={translate("sidebarMainMenu.postATask")}
          iconType="ion"
          iconName="add-circle-outline"
          onPress={() => {
            useUiStore.getState().setSelectedJobId(null)
            go("PostTask")
          }}
        />
      ) : null}

      {user.loggedIn ? (
        <>
          <SidebarLinkItem
            label={translate("sidebarMainMenu.inbox")}
            iconType="ion"
            iconName="chatbox-outline"
            onPress={guarded("Notifications")}
            disabled={locked}
            extraContent={
              countInbox.total ? (
                <View style={styles.circleInbox}>
                  <Text style={local.countText}>{countInbox.total}</Text>
                </View>
              ) : null
            }
          />
          <SidebarLinkItem label={translate("sidebarMainMenu.myTasks")} iconType="ion" iconName="checkmark" onPress={guarded("MyTasks")} disabled={locked} />
        </>
      ) : null}

      <View style={styles.lineSecond}></View>

      {FEATURES.payments && userSelect === "TASKER" && user.loggedIn ? (
        <SidebarLinkItem
          label={translate("sidebarMainMenu.incomeAccounts")}
          iconType="ant"
          iconName="creditcard"
          onPress={() => (locked ? onUnverified() : go("IncomeAccounts"))}
          disabled={locked}
        />
      ) : null}

      <SidebarLinkItem label={translate("sidebarMainMenu.contactSupport")} iconType="ant" iconName="inbox" onPress={() => go("Contact")} />
      <SidebarLinkItem label={translate("sidebarMainMenu.rateOurApp")} iconType="simple" iconName="heart" onPress={NOT_BUILT_YET} />
      <SidebarLinkItem
        label={translate("sidebarMainMenu.more")}
        iconType="ion"
        iconName="ellipsis-horizontal-outline"
        onPress={onMore}
        extraContent={<AntDesign style={styles.moreRight} name="right" size={Dimensions.get("screen").width < 380 ? 14 : 18} color={palette.white} />}
      />
    </View>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  countText: { color: palette.white, fontSize: 10, fontWeight: "700" }
})

export default SidebarMainMenu
