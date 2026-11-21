import { StyleSheet } from "react-native"
import { palette } from "./palette"

export default StyleSheet.create({
  container: {
    fontFamily: "Montserrat_700Bold",
    flex: 1,
    zIndex: 2,
    backgroundColor: palette.white
  },
  mainContent: {
    zIndex: 2
  },
  sosButton: {
    flexDirection: "row",
    width: "100%",
    padding: 0,
    paddingLeft: 15,
    paddingRight: 15
  },
  sosButtonIn: {
    paddingTop: 20,
    paddingBottom: 20,
    width: "50%"
  },
  sosButtonInText: {
    fontFamily: "Montserrat_300Light",
    fontSize: 12,
    maxWidth: "90%"
  },
  sosButtonButton: {
    flexDirection: "row",
    backgroundColor: palette.orange,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
    width: "100%"
  },
  sosButtonButtonText: {
    flexDirection: "row",
    color: palette.white,
    fontFamily: "Montserrat_700Bold",
    fontSize: 14
  },
  buttonImage: {
    height: 14,
    width: 20,
    marginLeft: 10
  },
  arrow: {
    width: 50,
    maxWidth: "100%",
    textAlign: "center",
    color: palette.white,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5
  },
  containerStyle: {
    flexGrow: 1
  },
  mainImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.overlay,
    position: "relative"
  },
  modalView: {
    width: "85%",
    margin: 20,
    backgroundColor: palette.white,
    alignItems: "center",
    shadowColor: palette.black,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  loginModalIn: {
    padding: 35,
    width: "100%",
    borderRadius: 10
  },
  button: {
    padding: 10,
    paddingBottom: 5,
    elevation: 2,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: palette.blueDark,
    flexDirection: "row",
    position: "relative",
    borderRadius: 5
  },
  textStyle: {
    width: "100%",
    color: palette.white,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center",
    lineHeight: 18,
    fontSize: 18,
    fontFamily: "Montserrat_500Medium"
  },
  chewronButton: {
    width: 25,
    height: 25,
    position: "absolute",
    right: "5%",
    top: "50%",
    transform: [{ translateY: -5 }]
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
    fontSize: 36,
    color: palette.white,
    paddingBottom: 30
  },
  inputLabel: {
    fontSize: 12,
    color: palette.white,
    fontFamily: "Montserrat_400Regular"
  },
  input: {
    fontSize: 16,
    top: 10,
    color: palette.black,
    fontFamily: "Montserrat_500Medium",
    padding: 8,
    backgroundColor: palette.white,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5
  },
  semiBold: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: palette.white,
    textAlign: "center"
  },
  line: {
    width: "100%",
    height: 2,
    backgroundColor: palette.white,
    marginTop: 20,
    marginBottom: 20
  },
  buttonFb: {
    marginTop: 0,
    marginBottom: 0
  },
  buttonGoogle: {
    marginBottom: 0
  },
  chewronButtonFb: {
    width: 25,
    height: 25,
    position: "absolute",
    right: "0%",
    top: "50%",
    transform: [{ translateY: -3 }]
  },
  chewronButtonGoogle: {
    width: 25,
    height: 25,
    position: "absolute",
    right: "2%",
    top: "50%",
    transform: [{ translateY: -3 }]
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10
  },
  moreShade: { position: "absolute", right: 0, width: 40, top: 0, bottom: 0, zIndex: 5 },
  categoriesSliderGrad: {
    flexDirection: "row",
    position: "relative"
  },
  sliderButtonImage: {
    height: 38
  },
  sliderButton: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 15,
    width: 92
  },
  sliderButtonText: {
    fontFamily: "Montserrat_300Light",
    fontSize: 10,
    color: palette.white,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  selectedButton: {
    backgroundColor: palette.blueDark
  },
  selectedButtonSecond: {
    backgroundColor: palette.orangeWarm
  },
  selectedButtonText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 10
  },
  inputSearch: {
    position: "relative",
    overflow: "visible",
    borderBottomWidth: 1,
    minHeight: 45,
    borderBottomColor: palette.gray100
  },
  inputIcon: {
    position: "absolute",
    top: 14,
    left: 7
  }
})
