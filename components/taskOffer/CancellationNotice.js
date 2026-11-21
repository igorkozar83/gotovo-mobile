// CancellationNotice.js
// Under a canceled offer: who canceled it, and the tasker's explanation when they did.
import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

const CancellationNotice = ({ offer }) => {
  if (offer.status !== 4) return null

  const explanation = offer.cancel_explanation
  return (
    <View style={atoms.paddingHorizontal22}>
      <Text accessibilityRole="header" style={styles.title}>
        {!explanation ? translate("cancellationNotice.taskCanceledByClient") : translate("cancellationNotice.taskCanceledByTaskerWithThis")}
      </Text>
      {explanation ? <Text style={styles.text}>{explanation}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontFamily: "Montserrat_600SemiBold", color: palette.redSoft, fontSize: small ? 10 : 12, marginVertical: 10 },
  text: { fontFamily: "Montserrat_500Medium", fontSize: small ? 10 : 12 }
})

export default CancellationNotice
