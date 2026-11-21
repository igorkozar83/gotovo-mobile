// CanceledTaskByTaskerModal.js
// The tasker canceled a client's task, with their reason. The client can look at the other offers or post
// the task again.
import React from "react"
import { Text, Pressable, ScrollView, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, SheetButton, SheetDivider } from "../sheets/SheetParts"
import { PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// data.task: { taskId, taskName, avatar, name, reason }
const CanceledTaskByTaskerModal = ({ onClose, visible, data }) => {
  const navigation = useNavigation()
  const close = onClose
  const go = (screen, params) => {
    navigation.navigate(screen, params)
    close()
  }

  return (
    <GradientModal visible={visible} onClose={close} onRequestClose={close} colors={BLUE} closeStyle={styles.closeButton} outerStyle={styles.sheet} keyboardAvoiding={false}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SheetIcon source={require("../../assets/cancelmodalbig.png")} />
        <SheetTitle style={atoms.marginBottom0}>{"canceledTaskByTaskerModal.taskerHasCanceledTheTask"}</SheetTitle>
        <SheetDivider gap={20} />
        <PromptTaskName style={styles.taskNameBlock} textStyle={styles.taskName}>
          {data.task.taskName}
        </PromptTaskName>
        <PromptParty user={{ avatar: data.task.avatar, name: data.task.name }} style={styles.party} />
        <Text style={[styles.small, styles.reason]}>{translate("common.reason")}</Text>
        <Text style={[styles.small, atoms.marginBottom40]}>{data.task.reason}</Text>
        <SheetButton
          text={"canceledTaskByTaskerModal.seeOtherOffers"}
          icon={require("../../assets/otheroffers.png")}
          iconStyle={atoms.top9}
          style={atoms.marginBottom15}
          onPress={() => go("Notifications", { viewOffers: true, taskDetailsId: data.task.taskId })}
        />
        <SheetButton
          text={"common.postThisTaskAgain"}
          color={palette.blueDark}
          textColor={palette.white}
          icon={require("../../assets/icon2.png")}
          iconStyle={styles.buttonIcon}
          onPress={() => go("PostTask", { repost: data.task.taskId })}
        />
        <Pressable onPress={close}>
          <Text style={styles.link}>{translate("canceledTaskByTaskerModal.noIAmGood")}</Text>
        </Pressable>
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "3%", top: "3%" },
  sheet: { paddingVertical: 20, overflow: "hidden" },
  taskNameBlock: { marginTop: 0, marginBottom: 20 },
  party: { marginTop: 0, marginBottom: 30 },
  reason: { fontFamily: "Montserrat_700Bold", marginBottom: 20 },
  content: { flexGrow: 1, padding: 20, borderRadius: 20, overflow: "hidden" },
  buttonIcon: { right: 20, aspectRatio: 1, width: 18, height: 18, top: 11 },
  taskName: { fontFamily: "Montserrat_700Bold", fontSize: 24 },
  small: { fontSize: 12, fontFamily: "Montserrat_400Regular", color: palette.white },
  link: { color: palette.white, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 16, marginTop: 20 }
})

export default CanceledTaskByTaskerModal
