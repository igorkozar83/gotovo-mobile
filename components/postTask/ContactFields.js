// ContactFields.js
// The task's contact phone: a logged-in user can use their verified phone instead of typing one.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Controller, useWatch } from "react-hook-form"

import TitleWithBorder from "../ui/TitleWithBorder"
import { ToggleBox } from "../ui/ChoiceControls"
import CustomTextInput from "../ui/CustomTextInput"
import PostTaskTip from "./PostTaskTip"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"
import styles from "../../styles/PostTask.style"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const ContactFields = ({ control, loggedIn }) => {
  const mobile = useAuthStore((state) => state.user.userData?.mobile)
  const useSavedPhone = useWatch({ control, name: "useSavedPhone" })
  const locked = Boolean(useSavedPhone && mobile)

  return (
    <>
      <View style={local.title}>
        <TitleWithBorder title={translate("contactFields.contact")}>
          <PostTaskTip textKey="Tooltip 3 (contact - POST A TASK)" />
        </TitleWithBorder>
      </View>
      {loggedIn && (
        <View style={local.savedPhoneRow}>
          <Text style={local.savedPhoneText}>{translate("contactFields.useMySavedPhoneNumber")}</Text>
          <Controller
            control={control}
            name="useSavedPhone"
            render={({ field: { value, onChange } }) => <ToggleBox accessibilityLabel={spokenLabel("contactFields.useMySavedPhoneNumber")} checked={value} onChange={onChange} />}
          />
        </View>
      )}
      <View style={atoms.marginTop0}>
        <Text style={styles.label}>{translate("contactFields.phoneNumber")}</Text>
      </View>
      <View style={atoms.paddingHorizontal22}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange } }) => (
            <CustomTextInput
              accessibilityLabel={spokenLabel("contactFields.phoneNumber")}
              keyboardType={"number-pad"}
              editable={!locked}
              value={value}
              onChangeText={onChange}
              style={[{ ...styles.descInput, marginHorizontal: 0, height: 40 }, locked && { color: palette.gray500 }]}
            />
          )}
        />
      </View>
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  title: { paddingHorizontal: 22, marginTop: 22, marginBottom: 10 },
  savedPhoneRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginHorizontal: 22 },
  savedPhoneText: { color: palette.black, maxWidth: "80%", fontSize: 18, fontFamily: "Montserrat_500Medium" }
})

export default ContactFields
