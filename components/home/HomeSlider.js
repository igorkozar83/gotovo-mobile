// HomeSlider.js
// The slides on top of Home (the role's own set from the app settings): they move on every 5 seconds, a
// row of bars shows where you are, and a slide opens its page.
import React, { useState, useRef, useEffect } from "react"
import { View, Text, Animated, Dimensions, Pressable, useWindowDimensions, StyleSheet } from "react-native"
import { ScrollView as GestureHandlerScrollView, GestureHandlerRootView } from "react-native-gesture-handler"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"

import FastImageComponent from "../media/FastImageComponent"
import useAppSettings from "../../hooks/queries/useAppSettings"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"
import { slideIn } from "../../Helpers/slides"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const BAR_SPACE = 7
const EVERY = 5000
// the white fade that keeps the text readable, the same on both sides' slides; a slide with no text (all of it
// in the picture) has none
const FADE = [palette.overlay, "transparent"]

const HomeSlider = () => {
  const navigation = useNavigation()
  const appSettings = useAppSettings()
  const role = useAuthStore((state) => state.userSelect) === "CLIENT" ? "CLIENT" : "TASKER"
  const language = useUiStore((state) => state.language)
  const slides = (role === "CLIENT" ? appSettings.clientSlider : appSettings.taskerSlider).map((slide) => slideIn(slide, language))

  const { width: windowWidth } = useWindowDimensions()
  const barWidth = windowWidth / 3 / slides.length - (slides.length - 1) * BAR_SPACE
  const offset = useRef(new Animated.Value(0)).current
  const scrollRef = useRef()

  // the slide shown next (moved to by the timer; a swipe does not change it)
  const [next, setNext] = useState(1)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!scrollRef.current) return
      scrollRef.current.scrollTo({ x: next * Dimensions.get("screen").width })
      setNext((i) => (slides.length - 1 <= i ? 0 : i + 1))
    }, EVERY)
    return () => clearInterval(timer)
  }, [next, slides.length])

  const open = (slide) => navigation.navigate("Slider", { slide })

  return (
    <View style={styles.carousel}>
      <GestureHandlerRootView style={atoms.flex1}>
        <GestureHandlerScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={10}
          pagingEnabled
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: offset } } }], { useNativeDriver: false, isInteraction: false })}
        >
          {slides.map((slide, i) => (
            <Pressable key={`image-slider-home-${role}-${i}`} onPress={() => open(slide)} style={atoms.flexDirectionRow}>
              <FastImageComponent source={slide.image} style={{ width: windowWidth }} />
              {slide.text || slide.black_text ? (
                <LinearGradient style={styles.text} colors={FADE} start={[0, 0]} end={[1, 0]}>
                  {slide.text ? <Text style={styles.sliderText}>{translate(slide.text)}</Text> : null}
                  {slide.black_text ? <Text style={styles.sliderTextBold}>{translate(slide.black_text)}</Text> : null}
                </LinearGradient>
              ) : null}
            </Pressable>
          ))}
        </GestureHandlerScrollView>
      </GestureHandlerRootView>
      {slides.length > 1 ? (
        <View style={styles.bars}>
          {slides.map((slide, i) => {
            const shift = offset.interpolate({ inputRange: [windowWidth * (i - 1), windowWidth * (i + 1)], outputRange: [-barWidth, barWidth], extrapolate: "clamp" })
            return (
              <View key={`bar-slider-home-${i}`} style={[styles.track, { width: barWidth, marginLeft: i === 0 ? 0 : BAR_SPACE }]}>
                <Animated.View style={[styles.bar, { width: barWidth, transform: [{ translateX: shift }] }]} />
              </View>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  carousel: { flex: 1, alignItems: "center", justifyContent: "center", height: Dimensions.get("screen").height / 2.5, zIndex: 100 },
  bars: { position: "absolute", zIndex: 100, bottom: 26, right: 25, flexDirection: "row" },
  track: { backgroundColor: palette.shade, overflow: "hidden", height: 2 },
  bar: { backgroundColor: palette.white, height: 2, position: "absolute", left: 0, top: 0 },
  text: { position: "absolute", zIndex: 2, bottom: 0, right: 0, left: 0, flexDirection: "column", paddingBottom: 10, paddingTop: 10, paddingLeft: 30 },
  sliderText: { fontFamily: "Montserrat_400Regular", color: palette.black, fontSize: 20, width: 250 },
  sliderTextBold: { fontFamily: "Montserrat_700Bold", fontSize: 26 }
})

export default HomeSlider
