// GuestSignUp.js
// For a guest posting a task: the invitation to log in, and the new account's details.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Controller } from "react-hook-form"
import { SimpleLineIcons } from "@expo/vector-icons"

import Button from "../ui/Button"
import TitleWithBorder from "../ui/TitleWithBorder"
import CustomTextInput from "../ui/CustomTextInput"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"
import styles from "../../styles/PostTask.style"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { personName } from "../../Helpers/validation"

export const LoginInvite = () => {
  const setAuthOpen = useUiStore((state) => state.setAuthOpen)

  return (
    <View style={local.block}>
      <LinearGradient style={local.card} colors={[palette.blueDark, palette.blue]}>
        <Text style={local.loginText}>{translate("guestSignUp.ifYouAlreadyHaveAGotovo")}</Text>
        <Button onPress={() => setAuthOpen(true)} title={translate("guestSignUp.login")} background={palette.white} textColor={palette.blueDark}>
          <SimpleLineIcons name="login" size={20} color={palette.blueDark} />
        </Button>
        <Text style={local.registerText}>{translate("guestSignUp.ifNotPleaseEnterDataBelow")}</Text>
      </LinearGradient>
    </View>
  )
}

const ACCOUNT_FIELDS = [
  // (the name fields take only what a name can hold)
  { name: "guest.name", label: "guestSignUp.name", clean: personName },
  { name: "guest.lastName", label: "guestSignUp.lastName", clean: personName },
  { name: "guest.email", label: "guestSignUp.email", keyboardType: "email-address" },
  { name: "guest.password", label: "guestSignUp.password", secureTextEntry: true },
  { name: "guest.confirmPassword", label: "guestSignUp.confirmPassword", secureTextEntry: true }
]

export const AccountDetails = ({ control }) => (
  <View>
    <View style={local.title}>
      <TitleWithBorder title={"guestSignUp.accountDetails"} />
    </View>
    {ACCOUNT_FIELDS.map((field) => (
      <View key={field.name}>
        <Text style={styles.label}>{translate(field.label)}</Text>
        <Controller
          control={control}
          name={field.name}
          render={({ field: { value, onChange } }) => (
            <CustomTextInput
              accessibilityLabel={spokenLabel(field.label)}
              keyboardType={field.keyboardType || "default"}
              value={value}
              onChangeText={field.clean ? (text) => onChange(field.clean(text)) : onChange}
              secureTextEntry={field.secureTextEntry || false}
              style={[styles.descInput, local.oneLine]}
            />
          )}
        />
      </View>
    ))}
  </View>
)

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  block: { padding: 20, marginTop: 40 },
  card: { borderRadius: 10, padding: 20 },
  loginText: { fontSize: 18, textAlign: "center", fontFamily: "Montserrat_500Medium", color: palette.white, marginBottom: 20 },
  registerText: { fontSize: 18, textAlign: "center", fontFamily: "Montserrat_500Medium", color: palette.white, marginTop: 20 },
  title: { paddingHorizontal: 22, marginTop: 32, marginBottom: 20 },
  // the description's box, one line high (growing with a large system font)
  oneLine: { height: undefined, minHeight: 42, textAlignVertical: "center" }
})
