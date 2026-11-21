// TooltipWithQuestionMark.js
// A question mark that opens a blue help bubble in the middle of the screen. The text is looked up in the
// stored translations (transl[language][tooltipTextKey]), or translated like any text when it is not there.
import React from "react"
import { View, Text, Platform, StatusBar, Pressable, Dimensions, StyleSheet } from "react-native"
import Tooltip from "react-native-walkthrough-tooltip"
import { AntDesign } from "@expo/vector-icons"

import QuestionMark from "./QuestionMark"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const MAX_WIDTH = Dimensions.get("window").width * 0.8

// the stored translation of the key; a key that is not there (a plain sentence) is translated as usual
const textOf = (translations, language, key) => (translations && translations[language] && translations[language][key]) || translate(key)

const TooltipWithQuestionMark = ({ transl, language, tooltipTextKey, visible, onClose, onOpen }) => (
  <View style={atoms.flex1}>
    <Tooltip
      showChildInTooltip={false}
      topAdjustment={Platform.OS === "android" ? -StatusBar.currentHeight + 6 : 0}
      isVisible={visible}
      onClose={onClose}
      content={
        <View style={styles.content}>
          <Text style={styles.text} numberOfLines={0}>
            {textOf(transl, language, tooltipTextKey)}
          </Text>
          <AntDesign onPress={onClose} name="close" size={16} color={palette.white} style={styles.close} />
        </View>
      }
      placement="center"
      animated={true}
      contentStyle={styles.bubble}
      arrowSize={{ width: 0, height: 0 }}
    >
      {/* the tooltip needs a child; the question mark below opens it */}
      <View />
    </Tooltip>
    <Pressable accessibilityRole="button" accessibilityLabel={translate("tooltipWithQuestionMark.help")} hitSlop={HIT_SLOP} onPress={onOpen} style={atoms.alignSelfCenter}>
      <QuestionMark />
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingVertical: 16, flexShrink: 1, maxWidth: MAX_WIDTH, position: "relative" },
  text: { fontFamily: "Montserrat_400Regular", color: palette.white, textAlign: "center", flexWrap: "wrap" },
  close: { position: "absolute", top: -4, right: -4, padding: 4 },
  bubble: { backgroundColor: palette.blue, borderRadius: 12, flexShrink: 1, maxWidth: MAX_WIDTH, padding: 10 }
})

export default TooltipWithQuestionMark
