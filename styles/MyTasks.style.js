// MyTasks.style.js
// The My Tasks screens: their scroll content and the arrow in the tasker's offer card.
import { StyleSheet } from "react-native"
import { palette } from "./palette"

export default StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
    paddingBottom: 30
  },
  arrow: {
    textAlign: "center",
    color: palette.white,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5
  }
})
