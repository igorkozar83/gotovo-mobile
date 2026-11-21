// CategoryScroller.js
// The Home categories, sideways, in the role's colours; the chosen one is highlighted. While there is
// more to the right an arrow scrolls on; it shows again when Home comes back or the category changes.
import React from "react"
import { Text, Pressable } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useIsFocused } from "@react-navigation/native"

import FastImageComponent from "../media/FastImageComponent"
import SideScroller from "../lists/SideScroller"
import useAppSettings from "../../hooks/queries/useAppSettings"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Home.style"
import { palette } from "../../styles/palette"

const LOOK = {
  CLIENT: { colors: [palette.blue, palette.blueDark], icon: "image", selected: styles.selectedButton },
  TASKER: { colors: [palette.orangeWarm, palette.orangeRust], icon: "imageOrange", selected: styles.selectedButtonSecond }
}

const SHADE = [palette.transparent, palette.shade]

const CategoryScroller = ({ role }) => {
  const look = LOOK[role === "CLIENT" ? "CLIENT" : "TASKER"]
  const appSettings = useAppSettings()
  const isFocused = useIsFocused()
  const selected = useUiStore((state) => state.selectedCat)
  const setSelected = useUiStore((state) => state.setSelectedCat)

  return (
    <LinearGradient colors={look.colors} style={styles.categoriesSliderGrad}>
      <SideScroller shadeColors={SHADE} shadeWidth={40} arrowColor={palette.white} arrowZ={7} resetKey={isFocused ? `shown-${selected}` : false}>
        {appSettings.buttons.map((button) => (
          <Pressable key={`button-slider-${button.id}`} style={[styles.sliderButton, selected === button.id && look.selected]} onPress={() => setSelected(button.id)}>
            <FastImageComponent source={button[look.icon]} style={{ ...styles.sliderButtonImage, width: 46, height: 45 }} />
            <Text numberOfLines={2} adjustsFontSizeToFit textBreakStrategy="simple" style={[styles.sliderButtonText, selected === button.id && styles.selectedButtonText]}>
              {translate(button.text)}
            </Text>
          </Pressable>
        ))}
      </SideScroller>
    </LinearGradient>
  )
}

export default CategoryScroller
