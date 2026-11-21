// CanceledTaskModal.js
// The other party canceled a task: its name and who canceled it. A tasker can go look at other tasks.
import React from "react"
import { Text, Pressable, ScrollView, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import GradientModal, { BLUE, ORANGE } from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, SheetButton, SheetDivider } from "../sheets/SheetParts"
import { PromptTaskName, PromptParty } from "../sheets/TaskPromptParts"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// data.task: { type, taskName, avatar, name }
const CanceledTaskModal = ({ onClose, visible, data }) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const client = user.userData.type === "CLIENT"

  return (
    <GradientModal
      visible={visible}
      onClose={onClose}
      onRequestClose={onClose}
      colors={data.task.type === "CLIENT" ? BLUE : ORANGE}
      closeStyle={styles.closeButton}
      outerStyle={atoms.paddingVertical20}
      keyboardAvoiding={false}
    >
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SheetIcon source={require("../../assets/cancelmodalbig.png")} />
        <SheetTitle>{client ? "canceledTaskModal.taskerHasCanceledTheTask" : "canceledTaskModal.clientHasCanceledTheTask"}</SheetTitle>
        <SheetDivider gap={20} />
        <PromptTaskName style={styles.taskNameBlock} textStyle={styles.taskName}>
          {data.task.taskName}
        </PromptTaskName>
        <PromptParty user={{ avatar: data.task.avatar, name: data.task.name }} style={styles.party} />
        {!client ? (
          <>
            <SheetButton
              text={"canceledTaskModal.seeOtherTasks"}
              textColor={palette.black}
              icon={require("../../assets/otheroffersblack.png")}
              style={atoms.marginBottom15}
              onPress={() => {
                navigation.navigate("Home")
                onClose()
              }}
            />
            <Pressable onPress={onClose}>
              <Text style={styles.link}>{translate("canceledTaskModal.noIAmGood")}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "3%", top: "3%" },
  taskNameBlock: { marginTop: 0, marginBottom: 20 },
  party: { marginTop: 0, marginBottom: 30 },
  content: { flexGrow: 1, padding: 20, borderRadius: 20, overflow: "hidden" },
  taskName: { fontFamily: "Montserrat_700Bold", fontSize: 24 },
  link: { color: palette.white, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 16, marginTop: 20 }
})

export default CanceledTaskModal
