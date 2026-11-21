// TabItem.js
// One tab of the inbox bar: its label (bold and underlined when shown) and the unread count after it (the whole
// number, the badge grows).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import CountBadge from "../ui/CountBadge"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const TabItem = ({ labelKey, isActive, onPress, notificationCount }) => (
  <View style={styles.wrapper}>
    <Pressable onPress={onPress} style={isActive ? styles.tabMainTextActive : null}>
      <Text style={isActive ? styles.tabTextActive : styles.tabText}>{translate(labelKey)}</Text>
    </Pressable>
    {notificationCount ? <CountBadge count={notificationCount} style={styles.badge} /> : null}
  </View>
)

const styles = StyleSheet.create({
  // over the label's upper right corner, growing to the left (the last tab ends at the screen's edge)
  badge: { top: -12, right: -12 },
  tabText: {
    fontSize: 13,
    paddingBottom: 10,
    fontFamily: "Montserrat_400Regular"
  },
  tabTextActive: {
    fontSize: 13,
    fontFamily: "Montserrat_700Bold",
    paddingBottom: 10
  },
  tabMainTextActive: {
    borderBottomColor: palette.black,
    borderBottomWidth: 3
  },
  wrapper: {
    position: "relative"
  }
})

// re-renders only when what it shows changes (onPress is a new function on every render of the bar)
const areEqual = (prev, next) => prev.labelKey === next.labelKey && prev.isActive === next.isActive && prev.notificationCount === next.notificationCount

export default React.memo(TabItem, areEqual)
