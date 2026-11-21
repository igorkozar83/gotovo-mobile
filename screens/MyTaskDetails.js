// MyTaskDetails.js
// Details of an active (not finished) task, opened by its id (route.params.taskId) from the "current" tab of
// My Tasks, a notification or an offer: its progress, the client's or the tasker's part of it, and the
// client's actions (another time, confirm complete, cancel).
import React, { useState } from "react"
import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native"

import Header from "../components/Header"
import ActivityInd from "../components/ui/ActivityInd"
import LoadingTask from "../components/taskDetails/LoadingTask"
import DateTimePicker from "../components/dateTime/DateTimePicker"
import TaskerTaskDetails from "../components/taskDetails/TaskerTaskDetails"
import TaskStepper from "../components/myTasks/TaskStepper"
import TaskDetailsClient from "../components/myTasks/TaskDetailsClient"
import MyTasksHero from "../components/myTasks/MyTasksHero"
import { RescheduleLink, ConfirmCompleteButton, CancelTask } from "../components/myTasks/TaskActions"
import useTaskDetailsActions from "../hooks/myTasks/useTaskDetailsActions"
import useStartedTaskPrompt from "../hooks/myTasks/useStartedTaskPrompt"
import useProposedTimePrompt from "../hooks/myTasks/useProposedTimePrompt"
import { useTaskDetail, useSetTaskCache } from "../hooks/queries/useDetails"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import useModalStore from "../stores/modalStore"
import { getActiveTaskSteps } from "../Helpers/taskSteps"
import { offerStatus, offerStatusTasker, isScheduled } from "../Helpers/taskStatus"

import styles from "../styles/MyTasks.style.js"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

// the progresses a client may cancel the task in; before an offer is accepted it is free (a note says so)
const FREE_CANCEL = ["posted", "received", "wait", "accepted"]
const SCHEDULED_CANCEL = ["scheduled", "revised"]

const MyTaskDetails = ({ route }) => {
  const taskQuery = useTaskDetail(route.params.taskId)
  if (!taskQuery.data) return <LoadingTask query={taskQuery} />
  return <MyTaskDetailsBody task={taskQuery.data} />
}

const MyTaskDetailsBody = ({ task }) => {
  const userSelect = useAuthStore((state) => state.userSelect)
  const userId = useAuthStore((state) => state.user.userData.id)
  const language = useUiStore((state) => state.language)
  const isClient = userSelect === "CLIENT"

  const setTask = useSetTaskCache(task.id)
  // as before, the progress is taken when the task is opened
  const [taskProgress] = useState(() => (isClient ? offerStatus(task) : offerStatusTasker(task)))

  const [dateTimePicker, setDateTimePicker] = useState(false)

  const { backToList, viewOffers, goToMessageUser, openTaskDetails, proposeNewTaskDate, doCancelTask, doAcceptRevision, doDeclineRevision } = useTaskDetailsActions(task)
  useStartedTaskPrompt(isClient ? task : null)

  // the other party proposed a new time: open the accept/decline modal
  useProposedTimePrompt(task, task.accepted_by_user, (proposed) => proposed.user_id && proposed.user_id !== userId)

  return (
    <>
      <ActivityInd />
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ ...styles.containerStyle, minHeight: Dimensions.get("screen").height, backgroundColor: palette.white }}
        bounces={false}
      >
        <Header back transparent />
        <View style={local.content}>
          <MyTasksHero userSelect={userSelect} task={task} />
          <View style={local.block}>
            <Text accessibilityRole="header" style={local.title}>
              {task.name}
            </Text>
          </View>
          <View style={atoms.paddingHorizontal20}>
            <TaskStepper steps={getActiveTaskSteps(task, taskProgress, userSelect, language)} />
          </View>
          {isClient && (
            <TaskDetailsClient
              task={task}
              taskProgress={taskProgress}
              language={language}
              openTaskDetails={openTaskDetails}
              viewOffers={viewOffers}
              goToMessageUser={goToMessageUser}
              doAcceptRevision={doAcceptRevision}
              doDeclineRevision={doDeclineRevision}
            />
          )}
          {isClient && isScheduled(task) && task.status === 1 && <RescheduleLink onPress={() => setDateTimePicker(true)} />}
          {task.status === 3 && task.posted_by === userId && <ConfirmCompleteButton onPress={() => useModalStore.getState().requestConfirmTask(task)} />}
          {isClient && FREE_CANCEL.includes(taskProgress) && <CancelTask withNote onCancel={doCancelTask} />}
          {isClient && SCHEDULED_CANCEL.includes(taskProgress) && <CancelTask onCancel={doCancelTask} />}
          {!isClient && <TaskerTaskDetails task={task} setTask={setTask} onBackToList={backToList} openTaskDetails={openTaskDetails} arrowStyle={styles.arrow} />}
          <DateTimePicker visible={dateTimePicker} onClose={() => setDateTimePicker(false)} onPick={proposeNewTaskDate} />
        </View>
      </ScrollView>
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  content: { zIndex: 2, backgroundColor: palette.white },
  block: { marginBottom: 20, padding: 20 },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 22 }
})

export default MyTaskDetails
