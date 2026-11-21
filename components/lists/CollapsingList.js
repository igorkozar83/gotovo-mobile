// CollapsingList.js
// A list under a header (a hero, tabs, a bar) that slides away as the list scrolls down and back as it
// scrolls up (the inbox tabs, My Tasks). The list fades while it loads and loads more near its end. Once the
// header has slid away, the status bar gets the list's background, so rows don't run under the clock.
import React, { useRef } from "react"
import { View, Animated, StyleSheet } from "react-native"
import { AnimatedFlashList } from "@shopify/flash-list"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// room under the last row for the raised POST A TASK button of the bottom bar
const END_SPACE = 40

/**
 * header / headerHeight: what sits on top and its height; clampFrom: how far past the top the header
 * tracks the scroll; fetching: the list is loading; canLoadMore / onLoadMore: the next page
 * listStyle: the list box's differences
 * the rest (data, renderItem, keyExtractor, estimatedItemSize, extraData, ListEmptyComponent, ...) goes to the list
 */
const CollapsingList = ({ header, headerHeight, clampFrom = -100, fetching, canLoadMore, onLoadMore, onEndReachedThreshold = 0.2, listStyle, background, ...list }) => {
  const insets = useSafeAreaInsets()
  const scrollY = useRef(new Animated.Value(0)).current
  const translateY = Animated.diffClamp(scrollY, clampFrom, headerHeight).interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp"
  })
  // the status bar's cover shows as the header's last part leaves it
  const coverOpacity = translateY.interpolate({
    inputRange: [-headerHeight, -headerHeight + Math.max(insets.top, 1)],
    outputRange: [1, 0],
    extrapolate: "clamp"
  })

  return (
    <>
      <View style={{ zIndex: 1, top: 0, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: background }}>
        <Animated.View style={[styles.header, { transform: [{ translateY }] }]}>{header}</Animated.View>
        <View style={[atoms.flex1, listStyle, fetching && { opacity: 0.3 }]}>
          <AnimatedFlashList
            bounces={false}
            contentContainerStyle={{ paddingTop: headerHeight + 10, paddingBottom: END_SPACE }}
            onEndReached={() => {
              if (canLoadMore && !fetching && onLoadMore) onLoadMore()
            }}
            onEndReachedThreshold={onEndReachedThreshold}
            onScroll={(e) => scrollY.setValue(e.nativeEvent.contentOffset.y)}
            {...list}
          />
        </View>
        <Animated.View pointerEvents="none" style={[styles.statusCover, { height: insets.top, backgroundColor: background || palette.white, opacity: coverOpacity }]} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  // the sliding box itself lies over the top (as tall as the header): an empty-height box with the header
  // absolute in it left the tabs outside its bounds, where Android's accessibility (TalkBack) does not reach
  header: { position: "absolute", top: 0, left: 0, right: 0, elevation: 4, zIndex: 4 },
  statusCover: { position: "absolute", top: 0, left: 0, right: 0, elevation: 5, zIndex: 5 }
})

export default CollapsingList
