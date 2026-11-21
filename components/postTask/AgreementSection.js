// AgreementSection.js
// Accepting the terms before posting (the text links to them).
import React from "react"
import { View, StyleSheet } from "react-native"
import { Controller } from "react-hook-form"

import TitleWithBorder from "../ui/TitleWithBorder"
import TermsAgreement from "../auth/TermsAgreement"
import PostTaskTip from "./PostTaskTip"
import { translate } from "../../Helpers/language.utils"
import styles from "../../styles/PostTask.style"

const AgreementSection = ({ control }) => {
  return (
    <>
      <View style={local.title}>
        <TitleWithBorder title={translate("common.agreement")}>
          <PostTaskTip textKey="Tooltip 4 (agrement - POST A TASK)" />
        </TitleWithBorder>
      </View>
      <Controller
        control={control}
        name="agreement"
        render={({ field: { value, onChange } }) => (
          <TermsAgreement checked={value} onChange={onChange} style={local.termsRow} textStyle={styles.agreementText} linkStyle={styles.agreementBold} />
        )}
      />
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  title: { paddingHorizontal: 22, marginTop: 22, marginBottom: 0 },
  termsRow: { flexDirection: "row", marginHorizontal: 22, justifyContent: "space-between", marginTop: 35 }
})

export default AgreementSection
