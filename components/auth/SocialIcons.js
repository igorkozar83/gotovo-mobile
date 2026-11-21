// SocialIcons.js
// The login modal's round Google and Apple buttons (Apple only where the device offers it).
import React from "react"
import { View, Text, Pressable, Platform, StyleSheet } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import * as AppleAuthentication from "expo-apple-authentication"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const Labelled = ({ label, style, children }) => (
  <View style={[styles.centered, style]}>
    {children}
    <Text style={styles.label}>{translate(label)}</Text>
  </View>
)

const SocialIcons = ({ client, onGoogle, apple }) => (
  <View style={[styles.row, client && Platform.OS === "ios" && { paddingBottom: 30 }]}>
    <Labelled label={"socialIcons.google"} style={{ marginRight: apple.available ? 30 : 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("socialIcons.google")}
        onPress={onGoogle}
        style={[styles.round, { backgroundColor: client ? palette.blueDark : palette.white }]}
      >
        <FontAwesome5 name="google" size={24} color={client ? palette.white : palette.orange} />
      </Pressable>
    </Labelled>
    {apple.available ? (
      <Labelled label={"socialIcons.apple"}>
        <View style={[styles.round, client && { overflow: "hidden" }]}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            // the tasker's style was never a real constant, so iOS draws its default
            buttonStyle={client ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : undefined}
            cornerRadius={client ? 5 : 50}
            style={styles.iconButton}
            onPress={apple.start}
          />
        </View>
      </Labelled>
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  centered: { justifyContent: "center", alignItems: "center" },
  iconButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  round: { width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 50 },
  label: { fontSize: 12, color: palette.white, fontFamily: "Montserrat_400Regular" }
})

export default SocialIcons
