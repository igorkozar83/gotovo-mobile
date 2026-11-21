// ContactSection.js
// The profile's email (read only) and mobile phone: an unverified phone opens its verification, a
// verified one can be removed or replaced.
import React from "react"
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"

import SectionTitle from "./SectionTitle"
import { RemoveButton, EditButton } from "../ui/RoundIconButton"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const ContactSection = ({ onVerifyPhone, onRemovePhone, onEditPhone }) => {
  const userData = useAuthStore((state) => state.user.userData)
  const mobile = userData.mobile ? String(userData.mobile) : ""
  const verified = Boolean(userData.phone_verified)

  return (
    <>
      <View style={styles.block}>
        <SectionTitle title={"CONTACT DETAILS"} tip={"Tooltip 2 contact details (profile)"} />
      </View>
      <View style={atoms.marginVertical10}>
        <Text style={styles.label}>{translate("contactSection.email")}</Text>
        {userData.email_verified_at && <Text style={styles.verified}>{translate("contactSection.emailVerified")}</Text>}
        <View style={styles.field}>
          <TextInput
            accessibilityLabel={spokenLabel("contactSection.email")}
            style={styles.email}
            value={userData.email || ""}
            blurOnSubmit
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
          />
        </View>
      </View>
      <View style={atoms.marginBottom10}>
        <Text style={styles.label}>{translate("contactSection.mobilePhone")}</Text>
        {verified && <Text style={styles.verified}>{translate("contactSection.phoneVerified")}</Text>}
        <View style={styles.phoneRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("common.verifyPhoneNumber")}
            style={[!verified && { width: "100%" }]}
            onPress={() => (!verified ? onVerifyPhone() : null)}
          >
            <View pointerEvents="none">
              <TextInput
                accessibilityLabel={spokenLabel("contactSection.mobilePhone")}
                style={[styles.phone, { fontSize: !mobile ? 12 : 16 }]}
                value={mobile}
                editable={false}
                placeholder={!verified ? translate("contactSection.phoneNotVerifiedTapToVerify") : ""}
                placeholderTextColor={palette.redBright}
              />
            </View>
          </Pressable>
          {verified && (
            <View style={styles.actions}>
              <RemoveButton onPress={onRemovePhone} />
              <EditButton onPress={onEditPhone} />
            </View>
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  block: { marginTop: 30, marginBottom: 10 },
  field: { marginBottom: 10, marginTop: 10 },
  actions: { flexDirection: "row", marginLeft: "auto" },
  phoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginTop: 10 },
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  verified: { color: palette.green, fontSize: 10, fontFamily: "Montserrat_400Regular" },
  email: { backgroundColor: palette.gray100, borderRadius: 5, paddingLeft: 5, fontFamily: "Montserrat_500Medium", fontSize: 16 },
  phone: { minWidth: "70%", backgroundColor: palette.gray100, paddingLeft: 5, borderRadius: 5, fontFamily: "Montserrat_500Medium" }
})

export default ContactSection
