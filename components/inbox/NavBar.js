// NavBar.js
// The inbox tabs, each with its unread count.
import React from "react"
import { View, StyleSheet } from "react-native"

import TabItem from "./TabItem"
import { useInboxCount } from "../../hooks/queries/useInboxCount"
import { palette } from "../../styles/palette"

const TABS = [
  { key: "OFFERS", countKey: "offers" },
  { key: "QA", countKey: "questions" },
  { key: "CHAT", countKey: "chat" },
  { key: "NOTIFICATIONS", countKey: "notifications" }
]

// tab: the shown tab; onTab(key): shows another
const NavBar = ({ tab, onTab }) => {
  const countInbox = useInboxCount()
  return (
    <>
      <View style={styles.container}>
        {TABS.map(({ key, countKey }) => (
          <TabItem key={key} labelKey={key} isActive={tab === key} onPress={() => onTab(key)} notificationCount={countInbox[countKey]} />
        ))}
      </View>
      <View style={styles.divider}></View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray700,
    backgroundColor: palette.white
  },
  divider: { borderBottomWidth: 1, borderBottomColor: palette.gray100 }
})

export default NavBar
