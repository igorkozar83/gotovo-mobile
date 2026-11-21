// TaskStartedModal.js
// The tasker marked the task started: the client confirms it did start, or says it did not. There is no
// close button; the client has to answer.
import React from "react"
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import { PromptHead, PromptTime, PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import ButtonWithPicture from "../ui/ButtonWithPicture"
import useStartedTaskAnswer from "../../hooks/myTasks/useStartedTaskAnswer"
import useUiStore from "../../stores/uiStore"
import { acceptedTimeOf, timeRangeOf } from "../../Helpers/taskStatus"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const TaskStartedModal = ({ data, visible, onClose }) => {
  const language = useUiStore((state) => state.language)
  const { other, confirm, deny } = useStartedTaskAnswer(data, onClose)
  const range = timeRangeOf(acceptedTimeOf(data && data.acceptedTime))

  return (
    <GradientModal visible={visible} colors={BLUE} keyboardAvoiding={false}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PromptHead question={"taskStartedModal.pleaseConfirmIfTaskHasStarted"} />
        {range ? <PromptTime {...range} language={language} /> : null}
        <PromptTaskName>{data && data.taskName}</PromptTaskName>
        <PromptParty user={other} style={atoms.marginTop10} />
        <View style={atoms.marginTop10}>
          <Text style={styles.note}>{translate("taskStartedModal.noteIfYouConfirmThatThe")}</Text>
        </View>
        <View style={atoms.marginTop20}>
          <ButtonWithPicture
            icon={require("../../assets/iconcheck.png")}
            onPress={confirm}
            backgroundColor={palette.white}
            text={translate("common.taskStarted")}
            textColor={palette.blueDark}
            textSize={16}
            fontFamily="Montserrat_600SemiBold"
            marginBottom={0}
          />
        </View>
        <View style={styles.buttons}>
          <Pressable onPress={deny}>
            <Text style={styles.notStarted}>{translate("taskStartedModal.taskNotStarted")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  buttons: { marginTop: 20, justifyContent: "center" },
  content: { borderRadius: 20, overflow: "hidden", padding: 20 },
  note: { color: palette.white, fontSize: 10, fontFamily: "Montserrat_400Regular" },
  notStarted: { color: palette.white, fontFamily: "Montserrat_700Bold", fontSize: 16, textAlign: "center" }
})

export default TaskStartedModal
