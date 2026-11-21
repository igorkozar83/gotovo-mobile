// SwitchToTaskerModal.js
// Shown once, the first time the user switches to the tasker role: what being a tasker means.
// (Always in the tasker's orange: the role check it had read the role before it was set.)
import React from "react"
import { View, Pressable, Text, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

import GradientModal from "../sheets/GradientModal"
import { roleColors } from "../../Helpers/roleColors"
import { translate } from "../../Helpers/language.utils"
import { SheetDivider } from "../sheets/SheetParts"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const SwitchToTaskerModal = ({ onClose, visible }) => (
  <GradientModal visible={visible} onClose={onClose} colors={roleColors("TASKER").gradient} closeStyle={styles.closeButton} keyboardAvoiding={false}>
    <View style={atoms.padding25}>
      <View style={styles.iconBlock}>
        <Text accessibilityRole="header" style={styles.title}>
          {translate("switchToTaskerModal.whatItTakesToBeA")}
        </Text>
      </View>
      <SheetDivider />
      <Text style={styles.text}>{translate("switchToTaskerModal.becomeAGotovoHandyman")}.</Text>
      <Pressable android_ripple={{ color: palette.bluePale, borderless: false }} style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>{translate("common.continue")}</Text>
        <MaterialIcons style={styles.buttonIcon} name="keyboard-double-arrow-right" size={20} color={palette.orangeDeep} />
      </Pressable>
    </View>
  </GradientModal>
)

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  iconBlock: { justifyContent: "center", alignItems: "center", marginTop: 30 },
  title: { fontSize: 24, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center", textTransform: "uppercase" },
  text: { textAlign: "center", fontSize: 20, fontFamily: "Montserrat_500Medium", color: palette.white, marginBottom: 10 },
  button: { borderRadius: 5, elevation: 2, flexDirection: "row", minHeight: 42, backgroundColor: palette.white, justifyContent: "center", alignItems: "center", width: "100%" },
  buttonText: { width: "100%", color: palette.orangeDeep, paddingLeft: 10, textAlignVertical: "center", fontSize: 20, fontFamily: "Montserrat_500Medium", textAlign: "center" },
  buttonIcon: { position: "absolute", right: 20, top: 10 }
})

export default SwitchToTaskerModal
