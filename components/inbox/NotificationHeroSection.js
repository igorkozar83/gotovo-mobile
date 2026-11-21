// NotificationHeroSection.js
// The inbox's top: the app header over the role's picture, "Inbox" and the
// number of unread items.
import React from "react"
import { View, Text, ImageBackground, StyleSheet } from "react-native"

import Header from "../Header"
import useAuthStore from "../../stores/authStore"
import { useInboxCount } from "../../hooks/queries/useInboxCount"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const PICTURES = { CLIENT: require("../../assets/inboxclient.png"), TASKER: require("../../assets/inboxtasker.png") }

const NotificationHeroSection = () => {
  const userSelect = useAuthStore((state) => state.userSelect)
  const countInbox = useInboxCount()

  return (
    <View style={atoms.height161}>
      <Header taskerLogo />
      <ImageBackground source={userSelect === "CLIENT" ? PICTURES.CLIENT : PICTURES.TASKER} resizeMode="cover" style={styles.image}>
        <Text accessibilityRole="header" style={styles.titleText}>
          {translate("notificationHeroSection.inbox")}
        </Text>
        <Text style={styles.countText}>
          {countInbox.total || 0} {translate("notificationHeroSection.unread")}
        </Text>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  image: { flex: 1, paddingHorizontal: 20 },
  titleText: { fontSize: 35.5, fontFamily: "Montserrat_700Bold", color: palette.white, marginTop: 75, lineHeight: 40 },
  countText: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", lineHeight: 35.5 }
})

export default NotificationHeroSection
