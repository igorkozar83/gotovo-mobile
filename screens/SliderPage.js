// SliderPage.js
// The page of a Home slide in the app's language: its picture and texts (a slide without a heading starts its
// text right under the picture), a price table of its options, and its button (a link opens in the browser; the
// other kinds only show their icon).
import React from "react"
import { ScrollView, View, Text, Linking, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { Feather } from "@expo/vector-icons"

import Header from "../components/Header"
import Button from "../components/ui/Button"
import FastImageComponent from "../components/media/FastImageComponent"
import useAppSettings from "../hooks/queries/useAppSettings"
import useRoleColors from "../hooks/useRoleColors"
import useUiStore from "../stores/uiStore"
import { translate } from "../Helpers/language.utils"
import { slideIn } from "../Helpers/slides"

import styles from "../styles/SliderPage.style"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

const LINK = 2
const ICON = { width: 20, height: 15 }
// the icon of each button kind (button_type)
const BUTTON_ICONS = {
  0: <Image style={ICON} source={require("../assets/coupon.png")} />,
  1: <Image style={ICON} source={require("../assets/share.png")} />,
  [LINK]: null,
  3: <Feather name="check" size={18} color={palette.white} />
}

const OptionRow = ({ option, currency, colors }) => (
  <View style={local.row}>
    <View style={{ flex: 0.7, width: "70%", backgroundColor: colors.tableLightBg, paddingVertical: 7, paddingLeft: 22 }}>
      <Text style={local.optionTitle}>{translate(option.text)}</Text>
    </View>
    <View style={{ flex: 0.3, alignSelf: "flex-end", backgroundColor: colors.tableDarkerBg, paddingVertical: 7, paddingRight: 22 }}>
      <Text style={local.optionValue}>
        {option.value} {currency}
      </Text>
    </View>
  </View>
)

// route.params.slide: the slide opened (from the Home slides)
const SliderPage = ({ route }) => {
  const page = slideIn(
    route.params.slide,
    useUiStore((state) => state.language)
  )
  const appSettings = useAppSettings()
  const colors = useRoleColors()
  const currency = appSettings.settings && appSettings.settings.currency ? appSettings.settings.currency.toUpperCase() : null

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.containerStyle}>
        <Header back />
        <View style={styles.mainContent}>
          <View style={styles.topPart}>
            <FastImageComponent source={page.image} style={styles.topPartImage} />
          </View>
          {page.text || page.black_text ? (
            <View style={local.heading} testID="slide-heading">
              {page.text ? <Text style={styles.additionalText}>{translate(page.text)}</Text> : null}
              {page.black_text ? <Text style={styles.blackText}>{translate(page.black_text)}</Text> : null}
            </View>
          ) : null}
          <View style={atoms.marginTop10}>{page.top_text ? <Text style={styles.topText}>{translate(page.top_text)}</Text> : null}</View>
          <View style={local.options}>
            {(page.options || []).map((option, index) => (
              <OptionRow key={`slide-page-option-list-${index}`} option={option} currency={currency} colors={colors} />
            ))}
          </View>
          <View>{page.middle_text ? <Text style={styles.topText}>{translate(page.middle_text)}</Text> : null}</View>
          {page.bottom_image ? (
            <View style={[styles.topPart, atoms.marginTop10]}>
              <FastImageComponent source={page.bottom_image} style={local.image} />
            </View>
          ) : null}
          <View>
            {page.subtitle ? (
              <Text style={{ color: colors.bgColor, fontSize: 24, fontFamily: "Montserrat_600SemiBold", marginLeft: 20, marginTop: 30 }}>{translate(page.subtitle)}</Text>
            ) : null}
            {page.bottom_text ? <Text style={[styles.topText, atoms.marginTop5]}>{translate(page.bottom_text)}</Text> : null}
          </View>
          {page.button_type in BUTTON_ICONS && (
            <View style={atoms.marginHorizontal20}>
              <Button
                title={page.button_text}
                background={page.type === 1 ? palette.orange : null}
                onPress={page.button_type === LINK ? () => Linking.openURL(page.button_action) : undefined}
              >
                {BUTTON_ICONS[page.button_type]}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  row: { flex: 1, flexDirection: "row" },
  optionTitle: { fontFamily: "Montserrat_700Bold", fontSize: 16 },
  image: { width: "100%", height: 218 },
  optionValue: { alignSelf: "flex-end", fontFamily: "Montserrat_700Bold", color: palette.white, fontSize: 16 },
  // (the space under the picture is the design's)
  heading: { marginTop: 24, marginLeft: 20, paddingRight: 20 },
  options: { flex: 1, alignItems: "center", justifyContent: "center" }
})

export default SliderPage
