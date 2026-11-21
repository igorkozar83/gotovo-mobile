import React, { useState, useEffect } from "react"
import { View, Pressable, Text, Dimensions, Platform, StyleSheet } from "react-native"

import Button from "../ui/Button"
import WideButton from "../ui/WideButton"
import CancelTaskTasker from "../modals/CancelTaskTasker"
import DateTimePicker from "../dateTime/DateTimePicker"
import FastImageComponent from "../media/FastImageComponent"
import TaskerOfferCard from "../myTasks/TaskerOfferCard"
import TaskerDates from "../myTasks/TaskerDates"
import useTaskerTaskActions from "../../hooks/myTasks/useTaskerTaskActions"

import { translate } from "../../Helpers/language.utils"
import { checkDiffToday } from "../../Helpers"
import { getTaskerOffer, getAcceptedTime } from "../../Helpers/taskStatus"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// Active task details as seen by the tasker whose offer was accepted.
const TaskerTaskDetails = ({ task, setTask, onBackToList, openTaskDetails, arrowStyle }) => {
  const colors = useRoleColors()
  const me = useAuthStore((state) => state.user.userData)
  const language = useUiStore((state) => state.language)
  const userType = me.type

  const [dateTimePicker, setDateTimePicker] = useState(false)
  const [selectableDate, setSelectableDate] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDateInit, setSelectedDateInit] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { goToMessageUser, proposeNewDate, doCompleteTask, doAcceptDate, doStartTask } = useTaskerTaskActions({ task, setTask, onBackToList })

  const offer = getTaskerOffer(task)
  const acceptedTime = getAcceptedTime(task)
  const startsTodayOrEarlier = acceptedTime && checkDiffToday(acceptedTime.date, "days") >= 0

  // once a date is accepted it's preselected and can't be changed
  useEffect(() => {
    const accepted = getAcceptedTime(task)
    if (!accepted) return
    setSelectedDateInit(accepted)
    setSelectedDate(accepted)
    setSelectableDate(false)
  }, [task])

  return (
    <View style={{ marginBottom: Platform.OS !== "ios" ? 40 : 10 }}>
      <View style={styles.intro}>
        <WideButton text={translate("common.viewOriginalTask")} onPress={() => openTaskDetails(true)} icon={require("../../assets/icon2.png")} iconStyle={styles.squareIcon} />
        <View style={atoms.marginTop40}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {translate("taskerTaskDetails.myOffer")}
          </Text>
        </View>
      </View>

      <TaskerOfferCard task={task} offer={offer} client={task.posted_by_user} arrowStyle={arrowStyle} />

      {task.status === 8 ? <Text style={[styles.warning, styles.subtitle]}>{translate("taskerTaskDetails.youHaveMarkedThisTaskAs")}</Text> : null}

      <View style={atoms.padding20}>
        <TaskerDates
          task={task}
          acceptedTime={acceptedTime}
          isTasker={userType !== "CLIENT"}
          selectedDate={selectedDate}
          selectedDateInit={selectedDateInit}
          selectable={selectableDate}
          onSelect={setSelectedDate}
          colors={colors}
          language={language}
        />

        {!acceptedTime && task.accepted_by === me.id && userType !== "CLIENT" && (
          <View style={styles.block}>
            <Button title={"taskerTaskDetails.acceptDate"} onPress={() => doAcceptDate(selectedDate)}>
              <View>
                <FastImageComponent style={styles.buttonIcon} source={require("../../assets/acceptdate.png")} />
              </View>
            </Button>
          </View>
        )}
        {startsTodayOrEarlier && (task.status === 1 || task.status === 0) && userType !== "CLIENT" ? (
          <View style={atoms.marginBottom10}>
            <Button title={translate("taskerTaskDetails.startTask")} onPress={() => doStartTask("TASKER")}>
              <View>
                <FastImageComponent style={[styles.buttonIcon, atoms.top5]} source={require("../../assets/gotitbutton.png")} />
              </View>
            </Button>
          </View>
        ) : null}
        {startsTodayOrEarlier && task.status === 9 && userType !== "CLIENT" ? (
          <View style={atoms.marginBottom10}>
            <Button title={translate("taskerTaskDetails.claimTaskComplete")} onPress={() => doCompleteTask()}>
              <View>
                <FastImageComponent style={styles.buttonIcon} source={require("../../assets/gotitbutton.png")} />
              </View>
            </Button>
          </View>
        ) : null}
        {task.flexible_dates && !acceptedTime && userType !== "CLIENT" ? (
          <>
            <View style={atoms.marginBottom10}>
              <Button onPress={() => setDateTimePicker(true)} background={palette.gray600} title={"taskerTaskDetails.proposeNewDate"}>
                <View>
                  <FastImageComponent style={styles.buttonIcon} source={require("../../assets/adddate.png")} />
                </View>
              </Button>
            </View>
            <Text style={styles.mediumText}>{translate("taskerTaskDetails.clientIndicatedThatDatesAreFlexible")}</Text>
          </>
        ) : null}
        {[1, 3, 5].includes(offer.status) ? (
          <View style={atoms.marginBottom20}>
            <Button background={palette.gray600} title={translate("common.sendMessage")} onPress={goToMessageUser}>
              <View>
                <FastImageComponent style={[styles.buttonIcon, atoms.top7]} source={require("../../assets/sendmessage.png")} />
              </View>
            </Button>
          </View>
        ) : null}
        {task.status === 1 || task.status === 0 ? (
          <>
            <Pressable android_ripple={{ color: palette.blue, borderless: false }} onPress={() => userType === "TASKER" && setCancelOpen(true)}>
              <Text style={[styles.bold16, atoms.textAlignCenter]}>{translate("taskerTaskDetails.youNeedToCancelThisTask")}</Text>
            </Pressable>
            <Text style={[styles.bold16, atoms.marginTop20]}>{translate("common.note")}</Text>
            {userType === "TASKER" && <Text style={styles.boldText}>{translate("taskerTaskDetails.ifYouCancelTooManyTasks")}</Text>}
          </>
        ) : null}
        {task.dispute ? <Text style={[styles.warning, atoms.fontSize12]}>{translate("taskerTaskDetails.taskIsCurrentlyUnderDisputeYou")}</Text> : null}
      </View>

      <CancelTaskTasker visible={cancelOpen} onClose={() => setCancelOpen(false)} taskDetails={task} />
      <DateTimePicker visible={dateTimePicker} onClose={() => setDateTimePicker(false)} onPick={proposeNewDate} />
    </View>
  )
}

const small = Dimensions.get("screen").width < 380

const styles = StyleSheet.create({
  intro: { padding: 20, paddingBottom: 10 },
  subtitle: { marginHorizontal: 20, marginTop: 20 },
  block: { marginBottom: 10, marginTop: 20 },
  mediumText: { fontFamily: "Montserrat_500Medium", fontSize: 16 },
  boldText: { fontFamily: "Montserrat_700Bold", fontSize: 14 },
  squareIcon: { aspectRatio: 1, width: 18, height: 18 },
  sectionTitle: { fontSize: 12, color: palette.orange, fontFamily: "Montserrat_700Bold" },
  warning: { fontFamily: "Montserrat_600SemiBold", color: palette.redSoft, fontSize: small ? 10 : 12 },
  buttonIcon: { width: 18.0, height: 18.0 },
  bold16: { fontFamily: "Montserrat_700Bold", fontSize: 16 }
})

export default TaskerTaskDetails
