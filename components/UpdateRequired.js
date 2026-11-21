// UpdateRequired.js
// Over the whole app when it is older than the API still serves (min_app_version): the app would call routes
// that no longer exist, so the only way on is the store.
import React from "react"
import { View, Text, Pressable, StyleSheet, Linking } from "react-native"

import { translate } from "../Helpers/language.utils"
import { storeUrl } from "../Helpers/appVersion"
import { reportError } from "../Helpers/reportError"
import { palette } from "../styles/palette"

const openStore = () => Linking.openURL(storeUrl()).catch((e) => reportError(e, "UpdateRequired"))

const UpdateRequired = () => (
  <View style={styles.screen} accessibilityViewIsModal>
    <Text accessibilityRole="header" style={styles.title}>
      {translate("updateRequired.updateTheApp")}
    </Text>
    <Text style={styles.text}>{translate("updateRequired.thisVersionOfTheAppIs")}</Text>
    <Pressable style={styles.button} onPress={openStore} accessibilityRole="button">
      <Text style={styles.buttonText}>{translate("updateRequired.update")}</Text>
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  // above the intro video and every modal
  screen: { ...StyleSheet.absoluteFillObject, zIndex: 100000, elevation: 100000, justifyContent: "center", alignItems: "center", padding: 30, backgroundColor: palette.white },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 22, color: palette.blueDark, textAlign: "center", marginBottom: 10 },
  text: { fontFamily: "Montserrat_400Regular", fontSize: 16, color: palette.gray800, textAlign: "center", marginBottom: 30 },
  button: { backgroundColor: palette.blueDark, borderRadius: 5, paddingVertical: 12, paddingHorizontal: 30 },
  buttonText: { fontFamily: "Montserrat_500Medium", fontSize: 16, color: palette.white }
})

export default UpdateRequired
