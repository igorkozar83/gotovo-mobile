// SidebarMoreMenu.js
// The side menu's "More" list, with a way back to the main links.
import React from "react"
import { View, Pressable, StyleSheet } from "react-native"

import SidebarLinkItem from "./SidebarLinkItem"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Sidebar.style"
import { HIT_SLOP } from "../../Helpers/accessibility"

// (the tutorial, "Priručnik", was taken out: there will be no content for it)
// go(screen): navigates and closes the menu; onBack: the main links
const SidebarMoreMenu = ({ go, onBack }) => (
  <View style={styles.topMenu}>
    <Pressable accessibilityRole="button" accessibilityLabel={translate("common.back")} hitSlop={HIT_SLOP} onPress={onBack}>
      <FastImageComponent style={local.tutorialIcon} source={require("../../assets/backarrowheader.png")} />
    </Pressable>
    <SidebarLinkItem iconType="ant" iconName="questioncircle" label={translate("sidebarMoreMenu.frequentlyAskedQuestions")} onPress={() => go("Faq")} />
    <SidebarLinkItem
      iconType="img"
      iconSource={require("../../assets/termsicon.png")}
      label={translate("sidebarMoreMenu.termsConditions")}
      onPress={() => go("TermsAndConditions")}
    />
    <SidebarLinkItem iconType="img" iconSource={require("../../assets/privacyicon.png")} label={translate("sidebarMoreMenu.privacyPolicy")} onPress={() => go("PrivacyPolicy")} />
  </View>
)

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  tutorialIcon: { width: 33, height: 23, marginBottom: 20 }
})

export default SidebarMoreMenu
