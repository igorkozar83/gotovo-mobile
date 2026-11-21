// TermsAgreement.js
// "By clicking below I confirm that I have read GOTOVO Terms & Conditions." (the name opens them) with
// its tick box. The row, the text and the name take the caller's styles (white on the auth modals).
import React, { useState } from "react"
import { View, Text, TouchableWithoutFeedback, StyleSheet } from "react-native"

import { ToggleBox } from "../ui/ChoiceControls"
import LegalModal from "../legal/LegalModal"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

/**
 * checked, onChange(checked): the tick box; small: the small box
 * style, textStyle, linkStyle: replace the row's, the text's and the name's own styles
 */
const TermsAgreement = ({ checked, onChange, small, style, textStyle, linkStyle }) => {
  // the terms open over everything, so a sign-up modal or a half-filled form stays as it is behind them
  const [reading, setReading] = useState(false)
  return (
    <View style={style || styles.row}>
      <Text style={textStyle || styles.text}>
        {translate("termsAgreement.byClickingBelowIConfirmThat")}{" "}
        <TouchableWithoutFeedback onPress={() => setReading(true)}>
          <Text style={linkStyle || styles.link}>{translate("termsAgreement.gotovoTermsConditions")}.</Text>
        </TouchableWithoutFeedback>
      </Text>
      <LegalModal page="terms" visible={reading} onClose={() => setReading(false)} />
      <ToggleBox
        accessibilityLabel={translate("termsAgreement.byClickingBelowIConfirmThat") + " " + translate("termsAgreement.gotovoTermsConditions")}
        small={small}
        checked={checked}
        onChange={onChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 35, alignItems: "center" },
  text: { fontFamily: "Montserrat_300Light", fontSize: 12, color: palette.white },
  link: { fontSize: 12, color: palette.white, fontFamily: "Montserrat_600SemiBold" }
})

export default TermsAgreement
