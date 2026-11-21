// BottomNavigation.style.js
// The bottom tab bar and the round post-a-task button.
import { StyleSheet } from "react-native"
import { palette } from "./palette"

export default StyleSheet.create({
  plusIcon: {
    position: "absolute",
    top: -22,
    zIndex: 9999
  },
  bottomNav: {
    flexDirection: "row",
    width: "100%",
    height: 60,
    position: "absolute",
    bottom: 0,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 0,
    borderTopColor: palette.transparent
  },
  topBorder: {
    backgroundColor: palette.transparent,
    height: 4,
    width: "100%",
    position: "absolute",
    top: -4,
    borderWidth: 0
  },
  styleButton: {
    flex: 0.2,
    paddingVertical: 10,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  buttonText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 10,
    textAlign: "center"
  },
  buttonTextMyTasks: {
    fontSize: 9
  },
  main: {
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: 43,
    height: 43
  },
  // the unread count (CountBadge), growing to the right from the icon's upper right corner
  notif: {
    top: 0,
    left: "50%",
    marginLeft: 2
  }
})
