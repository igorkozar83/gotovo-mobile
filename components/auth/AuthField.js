// AuthField.js
// A labelled input of the login and register forms, and a password input with a show/hide eye.
import React, { forwardRef, useState } from "react"
import { View, Text, TextInput, Pressable, TouchableOpacity, Platform, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel, HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

export const AuthField = forwardRef(({ label, labelStyle, onLayout, ...input }, ref) => (
  <View onLayout={onLayout}>
    <Text style={[styles.label, labelStyle]}>{translate(label)}</Text>
    <TextInput ref={ref} accessibilityLabel={spokenLabel(label)} autoCapitalize="none" submitBehavior="blurAndSubmit" style={styles.input} {...input} />
  </View>
))
AuthField.displayName = "AuthField"

// tapFocuses: the whole field (not only its text) focuses it
export const PasswordField = forwardRef(({ label, onLayout, lineHeight, tapFocuses, ...input }, ref) => {
  const [shown, setShown] = useState(false)
  const field = (
    <TextInput
      ref={ref}
      accessibilityLabel={spokenLabel(label)}
      autoCapitalize="none"
      submitBehavior="blurAndSubmit"
      style={[styles.input, { lineHeight, paddingRight: 40, paddingLeft: 40 }]}
      secureTextEntry={!shown}
      {...input}
    />
  )
  return (
    <View onLayout={onLayout}>
      <Text style={[styles.label, atoms.marginTop10]}>{translate(label)}</Text>
      <View style={atoms.positionRelative}>
        {tapFocuses ? (
          <TouchableOpacity accessible={false} activeOpacity={1} onPress={() => ref.current && ref.current.focus()}>
            <View pointerEvents="none" style={atoms.flex1}>
              {field}
            </View>
          </TouchableOpacity>
        ) : (
          field
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate(shown ? "authField.hidePassword" : "authField.showPassword")}
          hitSlop={HIT_SLOP}
          onPress={() => setShown((value) => !value)}
          style={styles.eye}
        >
          <Ionicons name={shown ? "eye-off" : "eye"} size={20} color={palette.gray550} />
        </Pressable>
      </View>
    </View>
  )
})
PasswordField.displayName = "PasswordField"

const styles = StyleSheet.create({
  label: { fontSize: 12, color: palette.white, fontFamily: "Montserrat_400Regular" },
  input: {
    fontSize: 14,
    lineHeight: 26,
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
  eye: { position: "absolute", right: 10, top: 0, bottom: 0, justifyContent: "center" }
})
