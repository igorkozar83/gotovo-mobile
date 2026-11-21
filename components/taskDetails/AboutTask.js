// AboutTask.js
// A task's facts: when it was posted, its job, name, description and the job's options (a number with its
// unit, or yes/no).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import ReadOnlyCheck from "../ui/ReadOnlyCheck"
import { timeFormatFullYear } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const Fact = ({ label, children, small }) => (
  <View style={atoms.marginBottom20}>
    <Text style={styles.label}>{translate(label)}</Text>
    <Text style={small ? styles.text : styles.value}>{children}</Text>
  </View>
)

const NumberOption = ({ option }) => {
  const info = option.task_option_info
  return (
    <View style={styles.optionRow}>
      <Text style={styles.text}>{translate(info.description)}:</Text>
      <View style={atoms.flexDirectionRow}>
        <Text style={styles.value}>{translate(option.task_option_value)}</Text>
        <View style={styles.row}>
          {info.unit_name !== "- (no unit)" ? (
            <>
              <Text style={styles.optionValue}>{info.unit_name}</Text>
              {info.unit_sup ? <Text style={styles.sup}>{info.unit_sup}</Text> : null}
              {info.unit_sub ? <Text style={styles.sub}>{info.unit_sub}</Text> : null}
            </>
          ) : null}
        </View>
      </View>
    </View>
  )
}

const YesNoOption = ({ option }) => (
  <View style={styles.optionRow}>
    <Text style={styles.text}>{translate(option.task_option_info.description)}</Text>
    <ReadOnlyCheck label={translate(option.task_option_info.description)} checked={parseInt(option.task_option_value, 10) === 1} />
  </View>
)

const AboutTask = ({ task, language }) => (
  <>
    <Fact label={"aboutTask.postedOn"}>{timeFormatFullYear(task.created, language)}</Fact>
    {/* (the job's name as the post form shows it: a catalog text, translated) */}
    <Fact label={"aboutTask.category"}>{task.sub_category_task ? translate(task.sub_category_task.description) : ""}</Fact>
    <Fact label={"common.taskName"}>{task.name}</Fact>
    <Fact label={"aboutTask.description"} small>
      {task.description}
    </Fact>
    {(task.options || []).map((option, index) => {
      if (option.task_option_info?.type === 1) return <NumberOption key={`task-option-${index}`} option={option} />
      if (option.task_option_info?.type === 2) return <YesNoOption key={`task-option-${index}`} option={option} />
      return null
    })}
  </>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end" },
  optionValue: { alignItems: "center", fontSize: 18, fontFamily: "Montserrat_300Light" },
  sup: { alignItems: "flex-start", fontSize: 12, alignSelf: "flex-start", fontFamily: "Montserrat_300Light" },
  sub: { alignItems: "flex-end", fontSize: 12, alignSelf: "flex-end", textAlignVertical: "bottom", fontFamily: "Montserrat_300Light" },
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular", color: palette.charcoal },
  value: { fontSize: 20, fontFamily: "Montserrat_600SemiBold", color: palette.ink },
  text: { fontSize: 16, fontFamily: "Montserrat_500Medium", color: palette.black },
  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }
})

export default AboutTask
