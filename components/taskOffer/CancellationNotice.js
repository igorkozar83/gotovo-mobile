// CancellationNotice.js
// Under a canceled offer: why. The tasker withdrew the offer ("offer canceled"), or canceled the task with their
// explanation, or the client canceled the task.
import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

// the server says who canceled it (canceled_by); an older offer without it was withdrawn when its task goes on
const withdrawnByTasker = (offer) => offer.canceled_by === "tasker" || (!offer.canceled_by && offer.task && offer.task.status !== 4)

const CancellationNotice = ({ offer }) => {
  if (offer.status !== 4) return null

  const explanation = offer.cancel_explanation
  const title = explanation
    ? "cancellationNotice.taskCanceledByTaskerWithThis"
    : withdrawnByTasker(offer)
      ? "cancellationNotice.offerCanceled"
      : "cancellationNotice.taskCanceledByClient"
  return (
    <View style={atoms.paddingHorizontal22}>
      <Text accessibilityRole="header" style={styles.title}>
        {translate(title)}
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
