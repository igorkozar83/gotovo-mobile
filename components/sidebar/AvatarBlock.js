// AvatarBlock.js
// The user's photo in the role's ring at the top of the side menu; logged in, it opens the profile.
import React from "react"
import { Pressable, ImageBackground, Platform, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"

const RINGS = { CLIENT: require("../../assets/clientavatarcircle.png"), TASKER: require("../../assets/taskeravatarcircle.png") }
const EDIT = { CLIENT: require("../../assets/editiconblue.png"), TASKER: require("../../assets/edit.png") }
const PHOTO = { width: 60, height: 60, borderRadius: 30, position: "relative", left: 2.5, top: 2.5 }

const AvatarBlock = ({ onOpenProfile }) => {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.userSelect) === "CLIENT" ? "CLIENT" : "TASKER"
  const avatar = user.userData?.avatar

  const photo = (
    <ImageBackground
      source={RINGS[role]}
      resizeMode="cover"
      style={{ width: 65, height: 65, position: "absolute", top: Platform.OS === "ios" ? -20 : -15, left: -30, zIndex: 10, overflow: "visible" }}
    >
      <FastImageComponent source={avatar || require("../../assets/emptyavatar.png")} style={PHOTO} />
    </ImageBackground>
  )

  if (!user.loggedIn) return photo

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={translate("common.profile")} style={styles.editButton} onPress={onOpenProfile}>
      {photo}
      <FastImageComponent style={styles.editIcon} source={EDIT[role]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  editButton: { position: "absolute", zIndex: 1000, justifyContent: "center", alignItems: "center", overflow: "visible" },
  editIcon: { top: -20, left: 15, overflow: "visible", width: 23, height: 23, zIndex: 11 }
})

export default AvatarBlock
