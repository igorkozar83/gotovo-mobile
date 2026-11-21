// ModalAppleNameLastName.js
// Signing in with Apple the first time (Apple may not share the name): the first and the last name, then
// the Apple login again with them. iOS only.
import React, { useState } from "react"
import { Text, Pressable, TextInput, StyleSheet, ScrollView, Platform } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import { roleColors } from "../../Helpers/roleColors"
import { translate } from "../../Helpers/language.utils"
import GradientModal from "../sheets/GradientModal"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"

// appleNameLastName(name, lastName): logs in with them
const ModalAppleNameLastName = ({ visible, onClose, userSelect, onSubmit }) => {
  const colors = roleColors(userSelect)
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")

  return (
    <GradientModal
      visible={visible}
      colors={colors.gradient}
      onClose={onClose}
      closeStyle={styles.closeBtn}
      outerStyle={styles.backdrop}
      avoidingStyle={styles.avoiding}
      cardStyle={styles.card}
      gradientStyle={styles.gradient}
      shadow="soft"
      dismissKeyboardOnTap={false}
    >
      <ScrollView scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          {translate("modalAppleNameLastName.appleAdditionalInfo")}
        </Text>
        <Text style={styles.label}>{translate("modalAppleNameLastName.firstName")}</Text>
        <TextInput
          autoCapitalize="none"
          style={styles.input}
          onChangeText={setName}
          accessibilityLabel={spokenLabel("modalAppleNameLastName.firstName")}
          placeholder={translate("modalAppleNameLastName.enterYourFirstName")}
          value={name}
        />
        <Text style={styles.label}>{translate("modalAppleNameLastName.lastName")}</Text>
        <TextInput
          autoCapitalize="none"
          style={styles.input}
          onChangeText={setLastName}
          accessibilityLabel={spokenLabel("modalAppleNameLastName.lastName")}
          placeholder={translate("modalAppleNameLastName.enterYourLastName")}
          value={lastName}
        />
        <Pressable style={styles.button} onPress={() => onSubmit(name, lastName)}>
          <Text style={[styles.buttonText, { color: colors.onWhite }]}>{translate("modalAppleNameLastName.loginWithApple")}</Text>
          <AntDesign name="apple-o" size={20} color={colors.onWhite} style={styles.buttonIcon} />
        </Pressable>
      </ScrollView>
    </GradientModal>
  )
}

export default ModalAppleNameLastName

const styles = StyleSheet.create({
  backdrop: { paddingTop: 10, paddingBottom: 20 },
  avoiding: { borderRadius: 20 },
  card: { marginVertical: 20, marginHorizontal: 20 },
  closeBtn: { right: 5, top: 10, zIndex: 2 },
  gradient: { borderRadius: 10, overflow: "visible" },
  content: { flexGrow: 1, borderRadius: 20, padding: 35 },
  title: { marginBottom: 15, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 36, color: palette.white, paddingBottom: 30 },
  label: { fontSize: 12, color: palette.white, fontFamily: "Montserrat_400Regular", marginTop: 0 },
  input: {
    fontSize: 14,
    lineHeight: Platform.OS === "ios" ? 18 : 26,
    color: palette.black,
    fontFamily: "Montserrat_500Medium",
    padding: 6,
    backgroundColor: palette.white,
    textAlign: "center",
    verticalAlign: "middle",
    height: Platform.OS === "ios" ? 44 : 40,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5
  },
  button: {
    padding: 15,
    paddingBottom: 10,
    elevation: 2,
    marginTop: 20,
    backgroundColor: palette.white,
    flexDirection: "row",
    position: "relative",
    borderRadius: 5,
    marginBottom: 30
  },
  buttonText: {
    width: "100%",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center",
    lineHeight: 18,
    fontSize: 18,
    fontFamily: "Montserrat_500Medium"
  },
  buttonIcon: { marginRight: 10, position: "relative", right: 15, top: -3 }
})
