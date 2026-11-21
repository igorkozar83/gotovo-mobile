// PostTask.style.js
// The task form (PostTask and components/postTask).
import { StyleSheet } from "react-native"
import { palette } from "./palette"

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white
  },
  containerStyle: {},
  postTaskMainImage: {
    width: "100%",
    aspectRatio: 2.3
  },
  topTaskTextBold: {
    color: palette.white,
    fontFamily: "Montserrat_700Bold",
    fontSize: 34
  },
  topTaskTextRegular: {
    color: palette.white,
    fontFamily: "Montserrat_300Light",
    fontSize: 34
  },
  categoriesSliderGrad: {
    position: "relative",
    flexDirection: "row"
  },
  sliderButtonImage: {
    height: 38
  },
  sliderButton: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 15,
    width: 90
  },
  sliderButtonText: {
    fontFamily: "Montserrat_300Light",
    fontSize: 10,
    color: palette.ink,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  selectedButton: {
    backgroundColor: palette.grayShadow
  },
  selectedButtonText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 10
  },
  topText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    marginHorizontal: 22,
    marginVertical: 15
  },
  button: {
    borderRadius: 0,
    elevation: 2,
    backgroundColor: palette.blueDark,
    flexDirection: "row",
    marginHorizontal: 22,
    alignItems: "center",
    height: 40
  },
  buttonNext: {
    backgroundColor: palette.blue,
    marginTop: 10,
    marginBottom: 40
  },
  nameInput: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginHorizontal: 22,
    marginBottom: 22,
    borderBottomColor: palette.black,
    borderBottomWidth: 1,
    fontFamily: "Montserrat_600SemiBold"
  },
  descInput: {
    paddingVertical: 10,
    paddingHorizontal: 7,
    marginHorizontal: 22,
    marginBottom: 0,
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    backgroundColor: palette.gray100,
    textAlignVertical: "top",
    borderRadius: 5,
    height: 120
  },
  label: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 10,
    color: palette.charcoal,
    marginHorizontal: 22,
    marginTop: 22,
    marginBottom: 5
  },
  photos: {
    flexDirection: "row",
    flex: 1,
    alignContent: "space-between",
    alignItems: "stretch",
    flexWrap: "wrap",
    marginHorizontal: 22
  },
  photosHolder: {
    justifyContent: "center",
    alignItems: "center",
    height: 85,
    backgroundColor: palette.gray350,
    borderRadius: 5,
    marginBottom: 5
  },
  image: {
    width: "100%",
    height: "100%"
  },
  buttonAltDates: {
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 25
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
  buttonConfTask: {
    backgroundColor: palette.blueDark
  }
})
