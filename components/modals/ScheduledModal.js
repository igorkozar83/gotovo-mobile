// ScheduledModal.js
// The reminder on the day of a scheduled task: its time, name and the other party, with the price to
// have ready, and ways to the task and to the other party's chat.
import React from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import GradientModal from "../sheets/GradientModal"
import { PromptHead, PromptTime, PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import ButtonWithPicture from "../ui/ButtonWithPicture"
import useLoadTask from "../../hooks/queries/useLoadTask"
import useUiStore from "../../stores/uiStore"
import { roleColors } from "../../Helpers/roleColors"
import { timeRangeOf } from "../../Helpers/taskStatus"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"
import { amount } from "../../Helpers"

const ScheduledModal = ({ data, visible, onClose, currency }) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const language = useUiStore((state) => state.language)
  const loadTask = useLoadTask()

  const role = user.userData.type
  // the other party: the tasker for a client, the client for a tasker
  const other = (role === "CLIENT" ? data.accepted_by : role === "TASKER" ? data.posted_by : null) || {}

  const viewTask = async () => {
    onClose()
    const task = await loadTask(data.task_id)
    if (!task) return
    // (loaded into the cache: the details show it)
    navigation.navigate("TaskDetails", { taskId: task.id })
  }

  const message = () => {
    navigation.navigate("Chat", { userId: other.id || null, taskId: data.task_id })
    onClose()
  }

  const button = (text, icon, onPress) => (
    <View style={atoms.marginTop10}>
      <ButtonWithPicture icon={icon} onPress={onPress} backgroundColor={palette.gray350} text={translate(text)} textColor={palette.blueDark} textSize={16} />
    </View>
  )

  return (
    <GradientModal visible={visible} onClose={onClose} onRequestClose={onClose} colors={roleColors(role).gradient} closeStyle={styles.closeButton} keyboardAvoiding={false}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PromptHead question={"scheduledModal.yourScheduledTaskIsToday"} icon={require("../../assets/bell.png")} iconStyle={styles.head} style={atoms.marginTop20} />
        {timeRangeOf(data.time) ? <PromptTime {...timeRangeOf(data.time)} language={language} /> : null}
        <PromptTaskName>{data.task_name}</PromptTaskName>
        {/* (the reminder push sends no last name for the tasker) */}
        <PromptParty user={{ avatar: other.avatar, name: [other.full_name, other.last_name].filter(Boolean).join(" ") }} />
        <View style={atoms.marginTop10}>
          <Text style={styles.note}>
            {translate("scheduledModal.pleaseMakeSureThatYouRe")}{" "}
            <Text style={atoms.fontFamilyMontserrat700Bold}>
              {amount(data.price)} {currency}.
            </Text>
          </Text>
        </View>
        {button("VIEW TASK", require("../../assets/vievtaskblue.png"), viewTask)}
        {button("SEND MESSAGE", require("../../assets/btnicnchat.png"), message)}
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  head: { height: 70, aspectRatio: 0.97 },
  content: { borderRadius: 20, overflow: "hidden", padding: 25 },
  note: { color: palette.white, fontSize: 14, fontFamily: "Montserrat_400Regular" }
})

export default ScheduledModal
