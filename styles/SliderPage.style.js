// SliderPage.style.js
// The slide page (SliderPage): its picture and texts.
import { StyleSheet } from "react-native"

export default StyleSheet.create({
  container: {
    fontFamily: "Montserrat_700Bold",
    flex: 1
  },
  containerStyle: {
    flexGrow: 1,
    paddingBottom: 20
  },
  mainContent: {
    paddingBottom: 100
  },
  topPart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  topPartImage: {
    width: "100%",
    aspectRatio: 1.3
  },
  blackText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 22
  },
  additionalText: {
    fontFamily: "Montserrat_300Light",
    fontSize: 22
  },
  topText: {
    fontFamily: "Montserrat_300Light",
    fontSize: 16,
    marginHorizontal: 22,
    marginVertical: 15
  }
})
