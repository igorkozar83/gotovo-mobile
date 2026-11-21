// TaskConfirmedModal.js
// "Your task has been confirmed": the accepted time, the task and the tasker, with view task, add to the
// phone's calendar and message the tasker. Closing it goes to My Tasks (reloaded).
import React, { useState } from "react"
import { StyleSheet, View, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import FastImageComponent from "../media/FastImageComponent"
import ButtonWithPicture from "../ui/ButtonWithPicture"
import useUiStore from "../../stores/uiStore"
import { useOpenTaskDetails } from "../../hooks/queries/useDetails"
import useTaskCalendarReminder from "../../hooks/myTasks/useTaskCalendarReminder"
import { dateMonth, hourMin } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { SheetDivider } from "../sheets/SheetParts"
import { palette } from "../../styles/palette"
import { showSuccessThen } from "../../stores/alerts"
import { atoms } from "../../styles/atoms"

const WhiteButton = ({ icon, text, onPress }) => (
  <View style={atoms.marginTop10}>
    <ButtonWithPicture
      icon={icon}
      onPress={onPress}
      backgroundColor={palette.white}
      text={translate(text)}
      textColor={palette.blueDark}
      textSize={15}
      marginBottom={0}
      fontFamily="Montserrat_600SemiBold"
    />
  </View>
)

/**
 * data: { task, user (the tasker), user_id }; confirmedDate: the accepted time ({ date, start, end })
 * visible / onClose(): shown or not
 */
const TaskConfirmedModal = ({ data, visible, onClose, confirmedDate }) => {
  const navigation = useNavigation()
  const openTaskDetails = useOpenTaskDetails()
  const language = useUiStore((state) => state.language)
  const addReminder = useTaskCalendarReminder()
  const [addedToCalendar, setAddedToCalendar] = useState(false)

  const at = (time) => confirmedDate.date + " " + time

  const toMyTasks = () => navigation.navigate("MyTasks", { refresh: true })

  const close = () => {
    onClose()
    toMyTasks()
  }

  // the task is shown as accepted
  const viewTask = () => {
    onClose()
    openTaskDetails({ ...data.task, status: 1 })
  }

  // the confirmed time goes to the phone's calendar; once saved the button goes and My Tasks follows
  const addToCalendar = async () => {
    onClose()
    if (!(await addReminder(data.task.name, confirmedDate))) return
    setAddedToCalendar(true)
    showSuccessThen("taskConfirmedModal.addDateToCalendarSuccess", "taskConfirmedModal.eventWasSavedToTheCalendar", toMyTasks)
  }

  const tasker = data.user || {}

  return (
    <GradientModal visible={visible} onClose={close} colors={BLUE} closeStyle={styles.closeButton} closeSize={38} cardStyle={styles.card} keyboardAvoiding={false}>
      <View style={atoms.padding25}>
        <View style={styles.center}>
          <FastImageComponent style={styles.headIcon} source={require("../../assets/iconcheckBig.png")} />
        </View>
        <View style={styles.center}>
          <Text style={styles.confirmed}>{translate("taskConfirmedModal.yourTaskHasBeenConfirmed")}</Text>
        </View>
        <SheetDivider />
        <View style={styles.timesRow}>
          <View style={styles.row}>
            <FastImageComponent style={styles.icon} source={require("../../assets/iconcal.png")} />
            <Text style={styles.dateTime}>{confirmedDate && dateMonth(at(confirmedDate.start), language)}</Text>
          </View>
          <View style={styles.row}>
            <FastImageComponent style={styles.icon} source={require("../../assets/iconclock.png")} />
            <Text style={styles.dateTime}>{confirmedDate && hourMin(at(confirmedDate.start)) + "-" + hourMin(at(confirmedDate.end))}</Text>
          </View>
        </View>
        <View style={[styles.center, atoms.flexDirectionRow]}>
          <Text style={styles.big}>{data.task.name}</Text>
        </View>
        <View style={[styles.row, atoms.marginTop10]}>
          <FastImageComponent source={tasker.avatar ? { uri: tasker.avatar } : require("../../assets/emptyavatar.png")} style={styles.avatar} />
          <Text style={[styles.big, styles.name]} ellipsizeMode="tail" numberOfLines={1}>
            {tasker.full_name}
          </Text>
        </View>
        <WhiteButton icon={require("../../assets/vievtaskblue.png")} text={"taskConfirmedModal.viewTask"} onPress={viewTask} />
        {!addedToCalendar && <WhiteButton icon={require("../../assets/addtocalblue.png")} text={"taskConfirmedModal.addToCalendar"} onPress={addToCalendar} />}
        <WhiteButton
          icon={require("../../assets/btnicnchat.png")}
          text={"common.sendMessage"}
          onPress={() => navigation.navigate("Chat", { userId: data.user_id, taskId: data.task.id })}
        />
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: 15, top: 15 },
  headIcon: { height: 60, aspectRatio: 1.23 },
  timesRow: { flexDirection: "row", justifyContent: "space-between" },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  card: { margin: 20, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  center: { justifyContent: "center", alignItems: "center", marginTop: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  confirmed: { fontSize: 16, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center" },
  icon: { width: 16, height: 16, marginRight: 12 },
  dateTime: { fontFamily: "Montserrat_300Light", fontSize: 16, color: palette.white },
  big: { fontSize: 24, fontFamily: "Montserrat_600SemiBold", color: palette.white, textAlign: "center", lineHeight: 30 },
  name: { marginLeft: 20, fontSize: 16, flex: 1 }
})

export default TaskConfirmedModal
