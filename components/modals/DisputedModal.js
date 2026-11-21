// DisputedModal.js
// The other party disputed a task: the task, who opened the dispute and their reason, with a way to
// message them.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import GradientModal from "../sheets/GradientModal"
import { SheetButton } from "../sheets/SheetParts"
import { PromptHead, PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import { roleColors } from "../../Helpers/roleColors"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const ICON = { width: 16, height: 16, right: 20, top: 12 }

// data: { taskId, taskName, reason, postedBy: { id, avatar, name } }
const DisputedModal = ({ data, visible, onClose }) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const role = user.userData.type
  const other = role === "CLIENT" ? "TASKER" : "CLIENT"

  const message = () => {
    navigation.navigate("Chat", { userId: data.postedBy.id, taskId: data.taskId })
    onClose()
  }

  if (!visible) return null
  return (
    <GradientModal visible={visible} onClose={onClose} colors={roleColors(role).gradient} closeStyle={styles.closeButton} keyboardAvoiding={false}>
      <View style={atoms.padding25}>
        <PromptHead
          question={translate(other === "CLIENT" ? "disputedModal.theClientOpenedADisputeAbout" : "disputedModal.theTaskerOpenedADisputeAbout")}
          icon={require("../../assets/disputedicon.png")}
          iconStyle={styles.head}
          style={atoms.marginTop30}
        />
        <PromptTaskName>{data.taskName}</PromptTaskName>
        {data.postedBy ? <PromptParty user={{ avatar: data.postedBy.avatar, name: data.postedBy.name }} /> : null}
        <Text style={[styles.reason, styles.boldText]}>{translate("common.reason")}</Text>
        <Text style={[styles.reason, atoms.marginTop12]}>{data.reason}</Text>
        <View style={atoms.marginTop30}>
          <SheetButton text={"common.sendMessage"} color={palette.gray350} icon={require("../../assets/btnicnchat.png")} iconStyle={ICON} onPress={message} />
          <SheetButton text={"common.ok"} icon={require("../../assets/iconcheck.png")} iconStyle={ICON} style={atoms.marginTop10} onPress={onClose} />
        </View>
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  head: { height: 75, aspectRatio: 1 },
  boldText: { fontFamily: "Montserrat_700Bold", marginTop: 15 },
  reason: { fontFamily: "Montserrat_400Regular", fontSize: 14, color: palette.white }
})

export default DisputedModal
