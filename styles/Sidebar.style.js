// Sidebar.style.js
// The side menu's styles (components/sidebar).
import { StyleSheet, Dimensions } from "react-native"
import { palette } from "./palette"

export default StyleSheet.create({
  mainMenu: {
    position: "absolute",
    top: 0,
    right: -((Dimensions.get("screen").width * 69) / 100),
    width: Dimensions.get("screen").width < 380 ? "66%" : "60%",
    bottom: 0,
    alignItems: "flex-start",
    paddingLeft: 0,
    zIndex: 205
  },
  shadow: {
    shadowColor: palette.black,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    overflow: "visible"
  },
  mask: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 99,
    backgroundColor: palette.whiteVeil
  },
  linkImage: {
    width: 17.5,
    height: 16.5,
    marginRight: 10,
    position: "relative",
    top: 5
  },

  topMenuPart: {
    height: 16
  },
  lineSpecial: {
    width: "86%",
    height: 2,
    right: 0,
    position: "absolute",
    backgroundColor: palette.white
  },
  bottomMenuPart: {
    position: "absolute",
    width: "100%",
    left: 10
  },
  closeBtn: {
    position: "absolute",
    right: "2.5%",
    top: 30,
    zIndex: 12,
    padding: 10
  },
  button: {
    marginTop: 10,
    color: palette.white,
    flexDirection: "row",
    alignItems: "center"
  },
  btnText: {
    marginLeft: 10,
    color: palette.white,
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    marginTop: 10,
    alignItems: "center",
    lineHeight: 16
  },
  posMenuIcon: {
    transform: [{ translateY: 3 }]
  },
  linkText: {
    // (breaks into a second line on a narrow phone instead of running off the menu: "Zaštita ličnih podataka")
    flexShrink: 1,
    fontSize: Dimensions.get("screen").width < 380 ? 14 : 18,
    color: palette.white,
    marginBottom: 0,
    textAlign: "left",
    fontFamily: "Montserrat_400Regular"
  },
  topMenu: {
    position: "relative",
    top: 0,
    textAlign: "left",
    paddingLeft: 10,
    width: "100%"
  },
  lineSecond: {
    marginLeft: "15%",
    width: "90%",
    right: 0,
    height: 2,
    backgroundColor: palette.white,
    marginBottom: 10
  },
  iconMarginRight: {
    marginRight: 10,
    position: "relative",
    top: 0
  },
  dflex: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  circleInbox: {
    borderRadius: 100,
    width: 18,
    height: 18,
    position: "relative",
    top: 1,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: palette.orange,
    color: palette.white,
    fontSize: 10,
    fontWeight: "700"
  },

  moreRight: {
    marginLeft: "auto",
    marginRight: 10,
    position: "relative",
    top: 0
  },

  // (right: clear of the close X and its touch area)
  languageSet: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 39,
    right: 72
  },

  languageLink: {
    color: palette.white,
    opacity: 0.5,
    fontSize: 15
  },
  languageLinkActive: {
    color: palette.white,
    fontSize: 15,
    fontWeight: "700"
  },

  topText: {
    color: palette.white,
    fontSize: 18,
    paddingLeft: 40,
    fontFamily: "Montserrat_700Bold"
  },

  choseUser: {
    flexDirection: "row"
  },

  flexColumn: {
    flexDirection: "column",
    paddingLeft: 40,
    alignItems: "flex-end",
    justifyContent: "center"
  },

  mt20: {
    marginTop: 20
  },

  p20: {
    paddingLeft: 20
  },

  colorWhite: {
    color: palette.white,
    fontWeight: "300"
  },

  userLink: {
    fontSize: Dimensions.get("screen").width < 410 ? 11 : 15,
    color: palette.white,
    textAlign: "center",
    fontFamily: "Montserrat_400Regular"
  },

  userLinkActive: {
    fontSize: Dimensions.get("screen").width < 410 ? 11 : 15,
    color: palette.white,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold"
  }
})
