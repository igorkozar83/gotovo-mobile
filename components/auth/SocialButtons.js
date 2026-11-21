// SocialButtons.js
// The register modal's full-width Google and Apple buttons (Apple only where the device offers it).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import * as AppleAuthentication from "expo-apple-authentication"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const SocialButtons = ({ onGoogle, onApple, appleAvailable }) => (
  <>
    <Pressable style={styles.button} onPress={onGoogle}>
      <Text style={styles.text}>{translate("socialButtons.google")}</Text>
      <Text style={styles.icon}>
        <FontAwesome5 name="google" size={18} color={palette.white} />
      </Text>
    </Pressable>
    {appleAvailable ? (
      <View style={styles.buttons}>
        <View style={atoms.width100Percent}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={5}
            style={styles.buttonInner}
            onPress={onApple}
          />
        </View>
      </View>
    ) : null}
  </>
)

const styles = StyleSheet.create({
  buttons: { justifyContent: "center", alignItems: "center", marginTop: 20 },
  buttonInner: { width: "100%", height: 32, justifyContent: "center", alignItems: "center" },
  button: {
    padding: 10,
    paddingBottom: 5,
    elevation: 2,
    marginTop: 20,
    marginBottom: 0,
    backgroundColor: palette.blueDark,
    flexDirection: "row",
    position: "relative",
    borderRadius: 5
  },
  text: {
    width: "100%",
    color: palette.white,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center",
    lineHeight: 18,
    fontSize: 18,
    fontFamily: "Montserrat_500Medium"
  },
  icon: { width: 25, height: 25, position: "absolute", right: "2%", top: "50%", transform: [{ translateY: -3 }] }
})

export default SocialButtons
