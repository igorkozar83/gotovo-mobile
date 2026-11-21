// DescribeSection.js
// The task's name and description, and the chosen job's options (a number or yes/no each).
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Controller, useWatch } from "react-hook-form"

import TitleWithBorder from "../ui/TitleWithBorder"
import CustomTextInput from "../ui/CustomTextInput"
import TaskOptionsItem from "./TaskOptionsItem"
import PostTaskTip from "./PostTaskTip"
import { translate } from "../../Helpers/language.utils"
import styles from "../../styles/PostTask.style"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"

const DescribeSection = ({ control, subTask, setOption, toggleOption }) => {
  const options = useWatch({ control, name: "options" })

  return (
    <>
      <View style={local.title}>
        <TitleWithBorder title={translate("describeSection.describeYourTask")}>
          <PostTaskTip textKey="Name of your task is the main info that will appear to the taskers, it should be short and to the point" />
        </TitleWithBorder>
      </View>
      <View style={local.nameRow}>
        <Text style={local.hint}>{translate("common.taskName")}</Text>
      </View>
      <Controller
        control={control}
        name="taskName"
        render={({ field: { value, onChange } }) => (
          <CustomTextInput
            accessibilityLabel={spokenLabel("common.taskName")}
            value={value}
            placeholder={translate("describeSection.housePaintingPipesFixingEtc")}
            onChangeText={onChange}
            placeholderTextColor={palette.gray400}
            style={{ ...styles.nameInput, fontSize: value ? 20 : 16, maxWidth: "100%", minHeight: 40 }}
          />
        )}
      />
      <View style={local.descriptionRow}>
        <Text style={styles.label}>{translate("describeSection.description")}</Text>
        <View style={local.counter} />
      </View>
      <Controller
        control={control}
        name="taskDesc"
        render={({ field: { value, onChange } }) => (
          <CustomTextInput
            accessibilityLabel={spokenLabel("describeSection.description")}
            multiline={true}
            scrollEnabled={false}
            numberOfLines={6}
            value={value}
            onChangeText={onChange}
            style={styles.descInput}
          />
        )}
      />
      {(subTask?.options || []).map((option, index) => (
        <TaskOptionsItem
          key={`task-options-list-post-task-main-${option.id}`}
          option={option}
          answer={options[index]}
          onChange={(text) => setOption(option.id, text)}
          onToggle={() => toggleOption(option.id)}
        />
      ))}
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  hint: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  counter: { marginRight: 22, marginTop: 22 },
  title: { paddingHorizontal: 22, marginTop: 22, marginBottom: 20 },
  nameRow: { flexDirection: "row", paddingHorizontal: 22, marginTop: 22, justifyContent: "space-between", alignItems: "center" },
  descriptionRow: { flexDirection: "row", marginTop: 0, justifyContent: "space-between", alignItems: "center" }
})

export default DescribeSection
