// TaskOffer.style.js
// The offer screen (TaskOffer, OfferCard, OfferDecision).
import { StyleSheet } from "react-native"
import { palette } from "./palette"

export default StyleSheet.create({
  mainContent: {
    zIndex: 2,
    paddingBottom: 100
  },
  containerStyle: {},
  mainImage: {
    width: "100%",
    height: 161
  },
  textBoldTop: {
    color: palette.white,
    fontFamily: "Montserrat_700Bold",
    fontSize: 34
  },
  textRegular: {
    color: palette.white,
    fontFamily: "Montserrat_300Light",
    fontSize: 34
  },
  holder: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: palette.gray100,
    justifyContent: "center"
  },
  yellowText: {
    alignContent: "center",
    color: palette.orange,
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 12,
    textAlign: "right",
    position: "relative"
  },
  textNormal: {
    alignContent: "center",
    fontFamily: "Montserrat_300Light",
    fontSize: 18
  },
  textBottomBold: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 22,
    marginTop: 2
  },
  textBottomNormal: {
    fontFamily: "Montserrat_300Light",
    fontSize: 19,
    marginTop: 10
  },
  arrow: {
    minWidth: "28%",
    textAlign: "right",
    color: palette.white,
    paddingVertical: 10,
    paddingLeft: 5,
    marginLeft: 10,
    position: "relative",
    left: 22
  },
  sectionTitle: {
    color: palette.blue,
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    marginHorizontal: 22,
    textAlign: "center",
    borderBottomColor: palette.blue,
    borderBottomWidth: 1,
    paddingBottom: 2
  },
  agreementText: {
    fontFamily: "Montserrat_300Light",
    fontSize: 12,
    color: palette.black,
    width: "75%"
  },
  agreementBold: {
    fontSize: 12,
    color: palette.black,
    width: "75%",
    fontFamily: "Montserrat_600SemiBold"
  },
  button: {
    borderRadius: 0,
    elevation: 2,
    flexDirection: "row",
    marginHorizontal: 22,
    minHeight: 42,
    backgroundColor: palette.blueDark,
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 25
  },
  buttonTasker: {
    borderRadius: 0,
    elevation: 2,
    flexDirection: "row",
    marginHorizontal: 22,
    minHeight: 42,
    backgroundColor: palette.orange,
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 25
  },
  textStyle: {
    width: "100%",
    color: palette.white,
    paddingLeft: 10,
    textAlignVertical: "center",
    fontSize: 18,
    fontFamily: "Montserrat_600SemiBold",
    justifyContent: "center",
    textAlign: "center"
  },
  buttonIcon: {
    width: 30,
    aspectRatio: 1.5,
    position: "absolute",
    right: 20,
    top: 0
  }
})
