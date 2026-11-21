// TaskActions.js
// What a client can do from the bottom of an active task: ask for another time, confirm the task
// complete, cancel it. The screen decides when each one shows.
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"

import ButtonWithPicture from "../ui/ButtonWithPicture"
import WideButton from "../ui/WideButton"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const SMALL_SCREEN = Dimensions.get("screen").width < 380

export const RescheduleLink = ({ onPress }) => (
  <Pressable onPress={onPress} style={styles.reschedule}>
    <Text style={styles.rescheduleText}>{translate("taskActions.doYouNeedToChangeThis")}</Text>
  </Pressable>
)

// (the "Something went wrong?" way into a dispute under it is switched off)
export const ConfirmCompleteButton = ({ onPress }) => (
  <View style={styles.confirmBox}>
    <WideButton
      text={translate("taskActions.confirmComplete")}
      onPress={onPress}
      color={palette.blueDark}
      icon={require("../../assets/checkwhite.png")}
      iconStyle={styles.confirmIcon}
      textStyle={atoms.fontSize18}
    />
  </View>
)

// withNote: remind that it is free before an offer is accepted
// (the 72h refund notes of a scheduled task are switched off)
export const CancelTask = ({ withNote, onCancel }) => (
  <View style={styles.block}>
    {withNote ? (
      <>
        <Text style={styles.blockTitle}>{translate("common.note")}</Text>
        <Text style={styles.noteText}>{translate("taskActions.youCanCancelTheTaskFree")}.</Text>
      </>
    ) : null}
    <ButtonWithPicture onPress={onCancel} text={translate("taskActions.cancelThisTask")} icon={require("../../assets/icon5.png")} backgroundColor={palette.orangeDeep} />
  </View>
)

const styles = StyleSheet.create({
  block: { padding: 20, marginBottom: 40 },
  blockTitle: { fontFamily: "Montserrat_700Bold", fontSize: 16 },
  confirmBox: { marginHorizontal: 20, marginBottom: 60, marginTop: 20 },
  confirmIcon: { right: "7%", width: 18, height: 14 },
  noteText: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, marginBottom: 5 },
  reschedule: { paddingHorizontal: 22, width: "100%", alignItems: "center", paddingVertical: 5, marginBottom: 10 },
  rescheduleText: { width: "100%", fontSize: SMALL_SCREEN ? 12 : 14, fontFamily: "Montserrat_700Bold", lineHeight: 30, textAlign: "center" }
})
