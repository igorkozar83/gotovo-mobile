// MyTasksTopPart.js
// The "My Tasks" hero (the role's picture) with the tabs, on top of each My Tasks tab (the lists, the calendar).
import React from "react"
import { ImageBackground, Text, View, StyleSheet } from "react-native"

import Header from "../Header"
import TabNavigation from "./TabNavigation"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

export const MY_TASKS_HEADER_HEIGHT = 220

const PICTURES = { CLIENT: require("../../assets/mytasksclient.png"), TASKER: require("../../assets/mytaskstasker.png") }

const MyTasksTopPart = ({ userSelect, screen, setScreen }) => (
  <View style={{ height: MY_TASKS_HEADER_HEIGHT }}>
    <View style={atoms.height161}>
      <Header />
      <ImageBackground source={userSelect === "CLIENT" ? PICTURES.CLIENT : PICTURES.TASKER} resizeMode="cover" style={styles.image}>
        <Text
          accessibilityRole="header"
          accessibilityLabel={translate("myTasksTopPart.mymytasks") + " " + translate("myTasksTopPart.tasksmytasks")}
          style={[styles.title, styles.heading]}
        >
          {translate("myTasksTopPart.mymytasks")}
        </Text>
        <Text importantForAccessibility="no" accessibilityElementsHidden style={[styles.title, atoms.fontFamilyMontserrat300Light]}>
          {translate("myTasksTopPart.tasksmytasks")}
        </Text>
      </ImageBackground>
    </View>
    <TabNavigation screen={screen} setScreen={setScreen} style={atoms.backgroundColorWhite} />
  </View>
)

const styles = StyleSheet.create({
  heading: { fontFamily: "Montserrat_700Bold", marginTop: 70 },
  image: { justifyContent: "center", height: 161, paddingLeft: 20 },
  title: { fontSize: 35.5, color: palette.white, lineHeight: 40 }
})

export default MyTasksTopPart
