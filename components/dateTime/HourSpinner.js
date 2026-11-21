// HourSpinner.js
// An hour with arrows above and below to change it: "From: 18 h".
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const twoDigits = (hour) => (hour < 10 ? "0" + hour : hour)

const HourSpinner = ({ label, hour, onStep, labelStyle, unitStyle }) => (
  <>
    <Text style={[styles.text, atoms.marginRight6, labelStyle]}>{translate(label)}</Text>
    <View style={styles.holder}>
      <Pressable accessibilityRole="button" accessibilityLabel={translate("hourSpinner.later")} hitSlop={HIT_SLOP} onPress={() => onStep(1)}>
        <FastImageComponent style={styles.arrow} source={require("../../assets/arrcalup-new.png")} />
      </Pressable>
      <Text style={styles.hour}>{twoDigits(hour)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={translate("hourSpinner.earlier")} hitSlop={HIT_SLOP} onPress={() => onStep(-1)}>
        <FastImageComponent style={styles.arrow} source={require("../../assets/arrcaldown-new.png")} />
      </Pressable>
    </View>
    <Text style={[styles.text, unitStyle]}>h</Text>
  </>
)

const styles = StyleSheet.create({
  text: { fontSize: 20, fontFamily: "Montserrat_300Light", color: palette.ink },
  hour: { fontSize: 40, fontFamily: "Montserrat_300Light", color: palette.blue, width: 65, flexWrap: "nowrap", justifyContent: "center", textAlign: "center" },
  holder: { flexDirection: "column", justifyContent: "center", textAlign: "center", alignItems: "center" },
  arrow: { width: 30, height: 15 }
})

export default HourSpinner
