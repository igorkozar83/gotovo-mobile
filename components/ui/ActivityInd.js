// ActivityInd.js
// The app-wide spinner over a faded screen while a loader holds it (uiStore.showSpinner).
import React from "react"
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native"

import useUiStore, { isSpinning } from "../../stores/uiStore"
import { palette } from "../../styles/palette"

const ActivityInd = () => {
  const loading = useUiStore(isSpinning)
  if (!loading) return null
  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} size="large" color={palette.blueDark} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: palette.overlay,
    zIndex: 100000,
    elevation: 1000,
    alignItems: "center",
    paddingTop: Dimensions.get("window").height / 2 - 18
  }
})

export default ActivityInd
