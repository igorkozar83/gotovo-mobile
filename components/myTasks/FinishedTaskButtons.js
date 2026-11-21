// FinishedTaskButtons.js
// "View original task" and, for the client, "View received offers" under the stepper of a finished task.
import React from "react"
import { View, StyleSheet } from "react-native"

import WideButton from "../ui/WideButton"
import { translate } from "../../Helpers/language.utils"
import { atoms } from "../../styles/atoms"

const FinishedTaskButtons = ({ userSelect, openTaskDetails, viewOffers }) => (
  <View style={atoms.marginBottom30}>
    <WideButton
      text={translate("common.viewOriginalTask")}
      onPress={() => openTaskDetails(true)}
      textStyle={atoms.fontSize18}
      icon={require("../../assets/icon2.png")}
      iconStyle={styles.buttonIcon}
    />
    {userSelect === "CLIENT" ? (
      <WideButton
        text={translate("finishedTaskButtons.viewReceivedOffers")}
        onPress={viewOffers}
        textStyle={styles.buttonText}
        icon={require("../../assets/icon1.png")}
        iconStyle={styles.offersIcon}
      />
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  buttonText: { fontSize: 18, lineHeight: 22 },
  offersIcon: { width: 18, height: 12 },
  buttonIcon: { aspectRatio: 1, width: 18, height: 18 }
})

export default FinishedTaskButtons
