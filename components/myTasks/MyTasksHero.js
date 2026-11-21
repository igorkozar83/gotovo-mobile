// MyTasksHero.js
// The picture on top of the My Tasks screens with the page title. Without a task: "My tasks" over the
// role's picture; with one: "Task details" over the picture of the task's job.
import React from "react"
import { View, Text, ImageBackground, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const ROLE_PICTURES = { CLIENT: require("../../assets/mytasksclient.png"), TASKER: require("../../assets/mytaskstasker.png") }

const jobPicture = (task, userSelect) => {
  const job = task.sub_category_task
  if (!job) return { uri: null }
  return { uri: userSelect === "CLIENT" ? job.image : job.image_task_details }
}

// (inside a View as before: the picture's flex: 1 is laid out against it)
const MyTasksHero = ({ userSelect, task }) => (
  <View>
    <ImageBackground source={task ? jobPicture(task, userSelect) : ROLE_PICTURES[userSelect === "CLIENT" ? "CLIENT" : "TASKER"]} resizeMode="cover" style={styles.hero}>
      <Text style={[styles.bold, task && styles.boldOnJob]}>{translate(task ? "myTasksHero.taskmytasks" : "myTasksHero.mymytasks")}</Text>
      <Text style={styles.light}>{translate(task ? "myTasksHero.detailsmytasks" : "myTasksHero.tasksmytasks")}</Text>
    </ImageBackground>
  </View>
)

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: "center", height: 161, paddingLeft: 20 },
  bold: { fontSize: 35.5, fontFamily: "Montserrat_700Bold", color: palette.white, lineHeight: 40, marginTop: 70 },
  boldOnJob: { textAlign: "left", left: 4 },
  light: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", lineHeight: 40 }
})

export default MyTasksHero
