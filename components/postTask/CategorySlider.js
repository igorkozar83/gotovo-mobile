// CategorySlider.js
// The categories on top of the task form, sideways; the chosen one is highlighted.
import React from "react"
import { View, Pressable, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import FastImageComponent from "../media/FastImageComponent"
import SideScroller from "../lists/SideScroller"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/PostTask.style"
import { palette } from "../../styles/palette"

const BACKGROUND = [palette.white, palette.gray325]
const SHADE = [palette.whiteClear, palette.gray350]
const ICON = { ...styles.sliderButtonImage, width: 46, height: 45 }
const HIDDEN = { width: 0, height: 0 }

// buttons: the categories (appSettings.buttons); selected: the chosen one's id; onSelect(id)
const CategorySlider = ({ buttons, selected, onSelect }) => (
  <View style={styles.categoriesSlider}>
    <LinearGradient colors={BACKGROUND} style={styles.categoriesSliderGrad}>
      <SideScroller shadeColors={SHADE} shadeWidth={60} arrowColor={palette.blue} nearEnd={10}>
        {buttons.map((button, index) => {
          const chosen = selected === button.id
          // both pictures stay loaded; the other one is hidden (no flicker when choosing)
          return (
            <Pressable key={`button-slider-${index}`} style={[styles.sliderButton, chosen && styles.selectedButton]} onPress={() => onSelect(button.id)}>
              <FastImageComponent source={button.postTaskImageSelected} style={[ICON, !chosen && HIDDEN]} />
              <FastImageComponent source={button.postTaskImage} style={[ICON, chosen && HIDDEN]} />
              <Text numberOfLines={2} adjustsFontSizeToFit textBreakStrategy="simple" style={[styles.sliderButtonText, chosen && styles.selectedButtonText]}>
                {translate(button.text)}
              </Text>
            </Pressable>
          )
        })}
      </SideScroller>
    </LinearGradient>
  </View>
)

export default CategorySlider
