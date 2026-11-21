// JobPicker.js
// The dropdown of the chosen category's jobs (the chosen one is the button's title).
import React from "react"
import { Pressable, Text, StyleSheet } from "react-native"

import PostTaskDropDown from "./PostTaskDropDown"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const JobPicker = ({ jobs, selected, onChoose }) => (
  // the dropdown closes when its `close` value changes: here, once a job is chosen
  <PostTaskDropDown title={selected?.description} close={selected?.id}>
    {jobs
      .filter((job) => job.id !== selected?.id)
      .map((job) => (
        <Pressable key={`dropdown-tasks-list-${job.id}`} onPress={() => onChoose(job)}>
          <Text style={styles.job}>{translate(job.description)}</Text>
        </Pressable>
      ))}
  </PostTaskDropDown>
)

const styles = StyleSheet.create({
  job: { color: palette.black, lineHeight: 18, marginVertical: 3, textTransform: "uppercase", fontSize: 12, fontFamily: "Montserrat_500Medium", paddingLeft: 10 }
})

export default JobPicker
