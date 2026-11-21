// MyTaskFinished.js
// Details of a finished or canceled task, opened by its id (route.params.taskId) from the "finished" tab of
// My Tasks or a notification.
import React from "react"
import { View, Dimensions, ScrollView, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import Header from "../components/Header"
import ActivityInd from "../components/ui/ActivityInd"
import MyTasksHero from "../components/myTasks/MyTasksHero"
import TaskDetailsFinished from "../components/myTasks/TaskDetailsFinished"

import useAuthStore from "../stores/authStore"
import LoadingTask from "../components/taskDetails/LoadingTask"
import { useOpenTaskDetails, useTaskDetail } from "../hooks/queries/useDetails"

import styles from "../styles/MyTasks.style.js"
import { palette } from "../styles/palette"

const MyTaskFinished = ({ route }) => {
  const taskQuery = useTaskDetail(route.params.taskId)
  if (!taskQuery.data) return <LoadingTask query={taskQuery} />
  return <MyTaskFinishedBody task={taskQuery.data} />
}

const MyTaskFinishedBody = ({ task }) => {
  const navigation = useNavigation()
  const userSelect = useAuthStore((state) => state.userSelect)

  const openDetails = useOpenTaskDetails()
  const openTaskDetails = (originalTimes) => openDetails(task, originalTimes ? { originalTimes: true } : undefined)

  const viewOffers = () => navigation.navigate("Notifications", { viewOffers: true, taskDetailsId: task.id })

  // after a review: back to the (refreshed) current tasks, then the notifications, as before
  const onReviewSubmitted = () => {
    navigation.navigate("MyTasks", { refresh: true })
    navigation.navigate("Notifications", { refreshOffers: true, viewOffers: true })
  }

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
          <TaskDetailsFinished taskDetails={task} userSelect={userSelect} openTaskDetails={openTaskDetails} viewOffers={viewOffers} onReviewSubmitted={onReviewSubmitted} />
        </View>
      </ScrollView>
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  content: { zIndex: 2, backgroundColor: palette.white }
})

export default MyTaskFinished
