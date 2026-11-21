// CloseButtonAndLanguageSelector.js
// The side menu's close X and the app languages (the chosen one underlined). They stand apart and their touch areas
// do not overlap: on a narrow phone a tap meant for EN closed the menu (the X's touch area reached over EN).
import React from "react"
import { View, Pressable, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import useAppSettings from "../../hooks/queries/useAppSettings"
import useUiStore from "../../stores/uiStore"
import { chooseLanguage } from "../../hooks/main/useLanguageSetup"

import styles from "../../styles/Sidebar.style"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP_ROW } from "../../Helpers/accessibility"

const CloseButtonAndLanguageSelector = ({ onClose }) => {
  const appSettings = useAppSettings()
  const language = useUiStore((state) => state.language)

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={translate("common.close")} hitSlop={CLOSE_SLOP} style={styles.closeBtn} onPress={onClose}>
        <Text>
          <Ionicons name="close" size={30} color={palette.white} />
        </Text>
      </Pressable>
      <View style={local.spacer} />
      <View style={styles.languageSet}>
        {appSettings.settings?.languages?.map((lang) => {
          const active = language === lang.shortName
          return (
            <Pressable
              key={`langs-list-${lang.shortName}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              hitSlop={HIT_SLOP_ROW}
              style={local.language}
              onPress={() => chooseLanguage(lang.shortName)}
            >
              {/* (every language the same box, only the chosen one's line shows: they stay on one line) */}
              <View style={[local.underline, active && { borderBottomColor: palette.white }]}>
                <Text style={active ? styles.languageLinkActive : styles.languageLink}>{lang.shortName}</Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </>
  )
}

// the X's touch area grows up, down and to the screen's edge, never left over the languages
const CLOSE_SLOP = { top: 10, bottom: 10, right: 10, left: 0 }

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  spacer: { height: 20, width: "100%" },
  // each language a wider target than its two letters
  language: { paddingHorizontal: 8, paddingVertical: 6 },
  underline: { borderBottomColor: palette.transparent, borderBottomWidth: 2, paddingHorizontal: 5, paddingBottom: 3 }
})

export default CloseButtonAndLanguageSelector
