// OfferFields.js
// The pieces of the offer modals: an amount on the orange arrow (typed, or shown dimmed) with the
// currency, and the explanation box.
import React from "react"
import { View, Text, TextInput, ImageBackground, StyleSheet } from "react-native"

import useAppSettings from "../../hooks/queries/useAppSettings"
import arrowOffer from "../../assets/arrowoffer.png"
import { translate } from "../../Helpers/language.utils"
import { localPriceFixed } from "../../Helpers"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

/**
 * value, onChange: the typed amount (without onChange it is shown, not edited)
 * dimmed: a previous amount; arrowMode: how the arrow is fitted; currencyStyle: the currency's offset
 */
export const AmountField = ({ label, value, onChange, dimmed, arrowMode = "cover", currencyStyle = { top: -3 } }) => {
  const appSettings = useAppSettings()
  const currency = appSettings.settings && appSettings.settings.currency ? appSettings.settings.currency.toUpperCase() : null
  const editable = !!onChange
  // typed: shown with a dot between thousands as it is typed ("200.000"), handed on as digits only ("200000")
  const input = editable
    ? { value: value ? localPriceFixed(Number(value)) : "", onChangeText: (typed) => onChange(typed.replace(/\D/g, "")), textAlign: "right", autoFocus: true, maxLength: 7 }
    : { value, editable: false }
  return (
    <View style={styles.amountRow}>
      {/* (the label breaks into two lines rather than squeezing the amount) */}
      <View style={styles.amountLabelBox}>
        <Text style={[styles.amountLabel, dimmed && { opacity: 0.5 }]}>{translate(label)}</Text>
      </View>
      <ImageBackground source={arrowOffer} resizeMode={arrowMode} style={[styles.arrow, dimmed && { opacity: 0.5 }]}>
        <View style={styles.row}>
          <TextInput accessibilityLabel={spokenLabel(label)} style={[styles.amount, editable && styles.amountTyped]} keyboardType="number-pad" {...input} />
          <Text style={[styles.currency, currencyStyle]}> {currency}</Text>
        </View>
      </ImageBackground>
    </View>
  )
}

export const ExplanationField = ({ label = "offerFields.addExplanation", value, onChange, onFocus, onBlur }) => (
  <View style={atoms.marginBottom30}>
    <Text style={styles.explanationLabel}>{translate(label)}</Text>
    <TextInput
      accessibilityLabel={spokenLabel(label)}
      value={value}
      multiline={true}
      numberOfLines={6}
      style={styles.explanation}
      onChangeText={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end" },
  amountRow: { justifyContent: "space-between", alignItems: "center", flexDirection: "row", marginBottom: 30, paddingRight: 60 },
  // a fixed share of the row: the label breaks into lines inside it, the arrow takes the rest (with flex the
  // dimmed previous amount pushed the label down to one letter a line)
  amountLabelBox: { width: "40%", paddingRight: 10 },
  amountLabel: { flexDirection: "row", color: palette.white, fontSize: 12, fontFamily: "Montserrat_700Bold" },
  // room for the largest amount with its dot ("200.000")
  amountTyped: { minWidth: 92 },
  arrow: {
    minWidth: 140,
    maxWidth: "60%",
    flexShrink: 1,
    textAlign: "center",
    color: palette.white,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingLeft: 10
  },
  amount: { color: palette.white, fontFamily: "Montserrat_700Bold", fontSize: 18 },
  currency: { color: palette.white, fontFamily: "Montserrat_600SemiBold", position: "relative" },
  explanationLabel: { fontFamily: "Montserrat_700Bold", fontSize: 12, color: palette.white, marginBottom: 5 },
  explanation: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginBottom: 0,
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    backgroundColor: palette.gray100,
    textAlignVertical: "top",
    borderRadius: 5,
    height: 80
  }
})
