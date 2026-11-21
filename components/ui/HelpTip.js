// HelpTip.js
// A question mark that shows a help text (a translation key) in a tooltip, in the role's color.
import React, { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import Tooltip from "react-native-walkthrough-tooltip"
import { AntDesign } from "@expo/vector-icons"

import QuestionMark from "./QuestionMark"
import { translate } from "../../Helpers/language.utils"
import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"

const HelpTip = ({ textKey }) => {
  const [visible, setVisible] = useState(false)
  const colors = useRoleColors()

  return (
    <>
      <Tooltip
        isVisible={visible}
        onClose={() => setVisible(false)}
        content={
          <View style={styles.tip}>
            <Text style={styles.tipText}>{translate(textKey)}</Text>
            <AntDesign onPress={() => setVisible(false)} name="close" size={12} color={palette.white} style={styles.tipIcon} />
          </View>
        }
        placement="left"
        animated={true}
        contentStyle={{ backgroundColor: colors.accent }}
        arrowSize={{ width: 0, height: 0 }}
      />
      <Pressable accessibilityRole="button" accessibilityLabel={translate("helpTip.help")} hitSlop={HIT_SLOP} onPress={() => setVisible(true)}>
        <QuestionMark />
      </Pressable>
    </>
  )
}

const styles = StyleSheet.create({
  tipText: { fontFamily: "Montserrat_400Regular", color: palette.white },
  tip: { paddingRight: 5, paddingLeft: 5, position: "relative" },
  tipIcon: { position: "absolute", top: -4, right: -6 }
})

export default HelpTip
