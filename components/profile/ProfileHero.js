// ProfileHero.js
// The picture on top of the user's own pages (the profile, the income accounts) in the role's colours,
// with the page's two-word title: the first word bold, the second light.
import React from "react"
import { View, Text, ImageBackground, StyleSheet } from "react-native"

import HeaderProfile from "../../assets/profileclient.png"
import HeaderProfileOrange from "../../assets/profiletasker.png"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const ProfileHero = ({ bold, light }) => {
  const userSelect = useAuthStore((state) => state.userSelect)

  return (
    <View>
      <ImageBackground source={userSelect === "CLIENT" ? HeaderProfile : HeaderProfileOrange} resizeMode="cover" style={styles.image}>
        <Text accessibilityRole="header" accessibilityLabel={translate(bold) + " " + translate(light)} style={styles.titleBold}>
          {translate(bold)}
        </Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden style={styles.titleLight}>
          {translate(light)}
        </Text>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  image: { flex: 1, justifyContent: "center", height: 161, paddingLeft: 20 },
  titleBold: { fontSize: 35.5, fontFamily: "Montserrat_700Bold", color: palette.white, marginBottom: 0, lineHeight: 40, marginTop: 70 },
  titleLight: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", lineHeight: 35.5, zIndex: 99999 }
})

export default ProfileHero
