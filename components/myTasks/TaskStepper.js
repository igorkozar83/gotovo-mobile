// TaskStepper.js
// The progress bar of a task: one column per step, its icon above its label and date (the steps come
// from Helpers/taskSteps).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const ICONS = {
  taskPosted: require("../../assets/taskposted.png"),
  offerReceived: require("../../assets/offerreceived.png"),
  offerRevised: require("../../assets/offerrevised.png"),
  offerAccepted: require("../../assets/offeraccepted.png"),
  offerAcceptedTasker: require("../../assets/ofacctasker.png"),
  scheduled: require("../../assets/scheduled.png"),
  inProgress: require("../../assets/icontaskinprogress.png"),
  completion: require("../../assets/completion.png"),
  completionTasker: require("../../assets/completiontasker.png"),
  taskCompleted: require("../../assets/takscomplete.png"),
  disputed: require("../../assets/disputediconmyasks.png"),
  canceled: require("../../assets/cancelred.png")
}

const INACTIVE = { opacity: 0.3 }

const TaskStepper = ({ steps, lineColor = palette.blueSoft }) => (
  <>
    <View style={styles.row}>
      {steps.map((step, index) => (
        <View key={index} style={styles.column}>
          <View style={styles.iconBackground} />
          <FastImageComponent contentFit="cover" style={[styles.icon, !step.active && INACTIVE]} source={ICONS[step.icon]} />
        </View>
      ))}
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
    <View style={[styles.row, styles.labels]}>
      {steps.map((step, index) => (
        <View key={index} style={styles.column}>
          <Text style={[styles.title, { color: step.color }, !step.active && INACTIVE]}>{step.title.map((key) => translate(key)).join("\n")}</Text>
          {step.date !== undefined && <Text style={[styles.date, step.dateVisible === false && styles.hidden]}>{step.date}</Text>}
        </View>
      ))}
    </View>
  </>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", position: "relative", alignItems: "center", marginBottom: 5 },
  labels: { alignItems: "flex-start", marginBottom: 30 },
  column: { width: "25%", alignItems: "center" },
  iconBackground: { backgroundColor: palette.white, width: 40, height: 40, position: "absolute" },
  icon: { width: 40, height: 40 },
  line: { position: "absolute", height: 2, left: 30, right: 30, zIndex: -2 },
  title: { fontSize: 9, fontFamily: "Montserrat_700Bold", textAlign: "center" },
  date: { fontSize: 9, fontFamily: "Montserrat_300Light", textAlign: "center" },
  hidden: { opacity: 0 }
})

export default TaskStepper
