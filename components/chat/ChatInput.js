// ChatInput.js
// The message field and its send arrow, above the bottom navigation (above the keyboard on iOS).
// The field loses focus when the keyboard goes away.
import React, { useEffect, useRef } from "react"
import { View, TextInput, Pressable, Dimensions, Platform, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"

const WIDTH = Dimensions.get("window").width
const GRADIENT = [palette.gray550, palette.gray225, palette.gray25, palette.white]

const ChatInput = ({ value, onChange, onSend, keyboard }) => {
  const inputRef = useRef()
  const ios = Platform.OS === "ios"

  useEffect(() => {
    if (!keyboard.open && inputRef.current) inputRef.current.blur()
  }, [keyboard.open])

  return (
    <View style={{ height: keyboard.open && ios ? 50 : keyboard.open ? 80 : 60, bottom: keyboard.open && ios ? keyboard.height : keyboard.open ? 80 : 50, width: WIDTH }}>
      <LinearGradient colors={GRADIENT} style={{ height: 60, width: WIDTH, overflow: "visible" }}>
        <TextInput
          autogrow={false}
          spellCheck={false}
          ref={inputRef}
          autoCorrect={false}
          placeholder={translate("chatInput.typeAMessage")}
          accessibilityLabel={translate("chatInput.typeAMessage")}
          placeholderTextColor={palette.black}
          value={value}
          multiline={true}
          style={[styles.input, { paddingBottom: keyboard.open && !ios ? 20 : 10 }, value ? styles.valued : null]}
          onChangeText={onChange}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={translate("chatInput.send")} hitSlop={HIT_SLOP} onPress={onSend} style={styles.send}>
          <FastImageComponent source={require("../../assets/chatarrow.png")} style={styles.sendIcon} />
        </Pressable>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  sendIcon: { width: 20, height: 20 },
  input: {
    paddingLeft: 30,
    paddingRight: 34,
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    textDecorationLine: "none",
    lineHeight: 30,
    verticalAlign: "middle",
    textAlignVertical: "center",
    height: 60,
    overflow: "visible"
  },
  valued: { fontFamily: "Montserrat_400Regular", fontSize: 18, color: palette.blueDark },
  send: { position: "absolute", right: 5, bottom: 18, overflow: "hidden", borderColor: palette.gray550, borderWidth: 0, borderRadius: 20, padding: 5 }
})

export default ChatInput
