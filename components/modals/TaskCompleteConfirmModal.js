// TaskCompleteConfirmModal.js
// The client confirms the tasker finished the task (its time, name and the other side), then goes on
// to review the tasker. (The "Something went wrong?" way into a dispute is switched off.)
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import { PromptHead, PromptTime, PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import ButtonWithPicture from "../ui/ButtonWithPicture"
import useConfirmComplete from "../../hooks/myTasks/useConfirmComplete"
import useUiStore from "../../stores/uiStore"
import { acceptedTimeOf, timeRangeOf } from "../../Helpers/taskStatus"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { FEATURES } from "../../Helpers/features"
import { atoms } from "../../styles/atoms"

const TaskCompleteConfirmModal = ({ data, visible, onDispute, onClose }) => {
  const language = useUiStore((state) => state.language)
  const { other, confirm } = useConfirmComplete(data, { onSend: onClose })
  const range = timeRangeOf(acceptedTimeOf(data && data.acceptedTime))

  if (!visible) return null
  return (
    <GradientModal visible={visible} onClose={onClose} colors={BLUE} closeStyle={styles.closeButton} keyboardAvoiding={false}>
      <View style={atoms.padding25}>
        <PromptHead question={"taskCompleteConfirmModal.pleaseConfirmIfTaskIsComplete"} style={atoms.marginTop30} />
        {range ? <PromptTime {...range} language={language} /> : null}
        <PromptTaskName>{data.taskName}</PromptTaskName>
        {other.avatar ? <PromptParty user={other} /> : null}
        <View style={atoms.marginTop30}>
          <ButtonWithPicture
            icon={require("../../assets/iconcheck.png")}
            onPress={confirm}
            backgroundColor={palette.white}
            text={translate("taskCompleteConfirmModal.taskIsComplete")}
            textColor={palette.blueDark}
            textSize={15}
            fontFamily="Montserrat_600SemiBold"
          />
        </View>
        {FEATURES.disputes ? (
          <View style={styles.disputeBlock}>
            <Pressable onPress={onDispute} accessibilityRole="button">
              <Text style={styles.disputeText}>{translate("taskCompleteConfirmModal.somethingWentWrong")}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  disputeBlock: { marginTop: 30, marginBottom: 10, justifyContent: "center" },
  disputeText: { color: palette.white, fontFamily: "Montserrat_700Bold", fontSize: 16, textAlign: "center" }
})

export default TaskCompleteConfirmModal
