// NewTimeProposed.js
// The other party proposed a new time for a task: its date and hours, the task and the tasker, to
// accept or decline (in the role's colours).
import React from "react"
import { View, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import GradientModal, { BLUE, ORANGE } from "../sheets/GradientModal"
import { PromptHead, PromptTime, PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import Button from "../ui/Button"
import useNewTimeAnswer from "../../hooks/myTasks/useNewTimeAnswer"
import useUiStore from "../../stores/uiStore"
import { shortenString } from "../../Helpers"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const NewTimeProposed = ({ data, visible, onClose }) => {
  const user = useAuthStore((state) => state.user)
  const language = useUiStore((state) => state.language)
  const { accept, decline } = useNewTimeAnswer(data, onClose)
  const colors = user.userData.type === "TASKER" ? ORANGE : BLUE

  return (
    <GradientModal visible={visible} onRequestClose={onClose} colors={colors} keyboardAvoiding={false} dismissKeyboardOnTap={false}>
      <View style={styles.body}>
        <PromptHead question={"newTimeProposed.newDateProposed"} style={atoms.marginTop10} />
        {data.date ? <PromptTime from={data.date[0]} to={data.date[1]} language={language} stacked style={atoms.marginBottom20} /> : null}
        <PromptTaskName>{data.taskName}</PromptTaskName>
        {data.acceptedBy ? <PromptParty user={{ avatar: data.acceptedBy.avatar, name: shortenString(data.acceptedBy.fullName, 20) }} style={styles.party} /> : null}
        <Button onPress={accept} background={palette.white} textColor={palette.blue} title={"newTimeProposed.accept"}>
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={palette.blue} />
        </Button>
        <View style={atoms.marginTop20}></View>
        <Button onPress={decline} background={palette.orangeDeep} textColor={palette.white} title={"newTimeProposed.decline"}>
          <MaterialCommunityIcons name="alpha-x-circle-outline" size={20} color={palette.white} />
        </Button>
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  body: { padding: 35, paddingTop: 20 },
  party: { marginTop: 10, marginBottom: 40 }
})

export default NewTimeProposed
