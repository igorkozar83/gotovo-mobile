// PasswordModal.js
// The profile's password change: the current password (not asked from social logins), the new one and
// its repetition.
import React from "react"
import { View, Pressable, Text, TextInput, ScrollView, Platform, StyleSheet } from "react-native"
import { AntDesign, FontAwesome5 } from "@expo/vector-icons"

import Button from "../ui/Button"
import WhiteModal from "../sheets/WhiteModal"
import usePasswordForm from "../../hooks/profile/usePasswordForm"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"
import { spokenLabel, HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const SecretField = ({ label, value, onChange }) => (
  <>
    <Text style={styles.label}>{translate(label)}</Text>
    <TextInput
      accessibilityLabel={spokenLabel(label)}
      style={styles.input}
      value={value}
      onChangeText={onChange}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={true}
    />
  </>
)

const PasswordModal = ({ visible, onClose }) => {
  const colors = useRoleColors()
  const user = useAuthStore((state) => state.user)
  const form = usePasswordForm(onClose)
  const asksCurrent = !user.userData.google_id && !user.userData.facebook_id

  return (
    <WhiteModal visible={visible} onClose={onClose}>
      <ScrollView automaticallyAdjustKeyboardInsets={true} style={styles.scroll}>
        <View style={styles.closeButton}>
          <Pressable accessibilityRole="button" accessibilityLabel={translate("common.close")} hitSlop={HIT_SLOP} onPress={onClose}>
            <AntDesign name="close" size={24} color={colors.bgColor} />
          </Pressable>
        </View>
        <View style={styles.buttons}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.textColor }]}>
            {translate("passwordModal.changePassword")}
          </Text>
        </View>
        {asksCurrent ? (
          <>
            <SecretField label={"passwordModal.currentPassword"} value={form.current} onChange={form.setCurrent} />
            <View style={[styles.divider, { backgroundColor: colors.bgColor }]}></View>
          </>
        ) : null}
        <View style={atoms.marginBottom20}>
          <SecretField label={"passwordModal.newPassword"} value={form.next} onChange={form.setNext} />
        </View>
        <View style={atoms.marginBottom20}>
          <SecretField label={"passwordModal.confirmPassword"} value={form.repeated} onChange={form.setRepeated} />
        </View>
        <Button onPress={form.submit} title={"passwordModal.confirmChange"}>
          <FontAwesome5 name="star-of-life" size={20} color={palette.white} />
        </Button>
      </ScrollView>
    </WhiteModal>
  )
}

const styles = StyleSheet.create({
  scroll: { overflow: "hidden", paddingHorizontal: 20 },
  buttons: { marginTop: 30, marginBottom: 20 },
  closeButton: { position: "absolute", top: 0, right: 0 },
  title: { fontSize: 24, fontFamily: "Montserrat_700Bold" },
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  input: {
    backgroundColor: palette.gray100,
    borderRadius: 5,
    textAlign: "center",
    fontFamily: "Montserrat_500Medium",
    paddingBottom: 5,
    paddingLeft: 5,
    lineHeight: 26,
    fontSize: 26,
    height: Platform.OS === "ios" ? 44 : 40
  },
  divider: { width: "100%", height: 2, marginVertical: 20 }
})

export default PasswordModal
