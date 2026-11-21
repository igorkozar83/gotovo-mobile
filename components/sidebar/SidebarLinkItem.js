import React from "react"
import { Text, Pressable, Dimensions } from "react-native"
import { AntDesign, Ionicons, SimpleLineIcons } from "@expo/vector-icons"

import styles from "../../styles/Sidebar.style"
import FastImageComponent from "../media/FastImageComponent"
import { palette } from "../../styles/palette"

const ICON_SIZE = Dimensions.get("screen").width < 380 ? 14 : 18

const SidebarLinkItem = ({
  label,
  iconType = "ant", // ant | ion | simple | img
  iconName,
  iconSource,
  onPress,
  extraContent,
  disabled = false
}) => {
  const IconMap = {
    ant: AntDesign,
    ion: Ionicons,
    simple: SimpleLineIcons
  }

  const IconComponent = IconMap[iconType]

  return (
    <Pressable style={[styles.dflex, disabled && { opacity: 0.3 }]} onPress={onPress} disabled={disabled}>
      {iconType === "img" ? (
        <FastImageComponent style={[styles.iconMarginRight, styles.linkImage]} source={iconSource} />
      ) : (
        IconComponent && <IconComponent style={styles.iconMarginRight} name={iconName} size={ICON_SIZE} color={palette.white} />
      )}
      <Text style={styles.linkText}>{label}</Text>
      {extraContent}
    </Pressable>
  )
}

export default SidebarLinkItem
