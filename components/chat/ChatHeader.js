// ChatHeader.js
// The chat's top: a back arrow, "Chat" with the task's name, and the inbox tabs. It slides with the
// messages (translateY).
import React from "react"
import { View, Text, Pressable, ImageBackground, Animated, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import NavBar from "../inbox/NavBar"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"

const ChatHeader = ({ taskName, userSelect, translateY, onBack, onTab }) => (
  <Animated.View style={[styles.header, { transform: [{ translateY }] }]}>
    <View>
      <View>
        <Pressable accessibilityRole="button" accessibilityLabel={translate("common.back")} hitSlop={HIT_SLOP} onPress={onBack} style={styles.backButton}>
          <FastImageComponent style={styles.backArrow} source={require("../../assets/backarrowheader.png")} />
        </Pressable>
        <ImageBackground
          source={userSelect === "CLIENT" ? require("../../assets/inboxclient.png") : require("../../assets/inboxtasker.png")}
          resizeMode="cover"
          style={styles.image}
        >
          <Text accessibilityRole="header" style={styles.title}>
            {translate("chatHeader.chat")}
          </Text>
          <Text style={styles.task} ellipsizeMode="tail" numberOfLines={1}>
            {taskName}
          </Text>
        </ImageBackground>
      </View>
      <NavBar tab="CHAT" onTab={onTab} />
    </View>
  </Animated.View>
)

const styles = StyleSheet.create({
  // the sliding box lies over the top itself (not an empty-height box with the header absolute in it,
  // whose buttons Android's accessibility could not reach)
  header: { position: "absolute", top: 0, left: 0, right: 0, elevation: 4, zIndex: 4 },
  backButton: { position: "absolute", top: 40, left: 20, zIndex: 20 },
  backArrow: { height: 30, width: 43 },
  image: { height: 161, paddingLeft: 20 },
  title: { fontSize: 35.5, color: palette.white, marginBottom: 0, lineHeight: 35.5, marginTop: 80, fontFamily: "Montserrat_700Bold" },
  task: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", lineHeight: 35.5, zIndex: 99999, top: 2, maxWidth: 250 }
})

export default ChatHeader
