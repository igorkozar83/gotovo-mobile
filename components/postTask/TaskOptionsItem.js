// TaskOptionsItem.js
// One extra question of the chosen job in the task form: a number with its unit (type 1), or a yes/no
// box (type 2).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import { ToggleBox } from "../ui/ChoiceControls"
import CustomTextInput from "../ui/CustomTextInput"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const NO_UNIT = "- (no unit)"

/**
 * option: the job's option ({ id, type, description, unit_name, unit_sup, unit_sub })
 * answer: its entry in the form ({ value }); the field shows once it is there
 * onChange(text): the number typed; onToggle(): the yes/no flipped
 */
const TaskOptionsItem = ({ option, answer, onChange, onToggle }) => {
  if (option.type === 1) {
    const unit = option.unit_name
    return (
      <View style={[styles.row, atoms.alignItemsFlexEnd]}>
        <Text style={styles.label}>{translate(option.description)}</Text>
        <View style={styles.numberField}>
          {answer && (
            <CustomTextInput
              accessibilityLabel={spokenLabel(option.description)}
              value={String(answer.value)}
              onChangeText={onChange}
              keyboardType="numeric"
              style={styles.number}
              maxLength={4}
            />
          )}
          {unit && unit !== NO_UNIT ? <Text style={styles.unit}>{translate(unit)}</Text> : null}
          {unit && option.unit_sup ? <Text style={styles.small}>{translate(option.unit_sup)}</Text> : null}
          {unit && option.unit_sub ? <Text style={[styles.small, atoms.textAlignVerticalBottom]}>{translate(option.unit_sub)}</Text> : null}
        </View>
      </View>
    )
  }
  if (option.type === 2) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{translate(option.description)}</Text>
        <View style={atoms.flexDirectionRow}>{answer && <ToggleBox accessibilityLabel={spokenLabel(option.description)} checked={!!answer.value} onChange={onToggle} />}</View>
      </View>
    )
  }
  return null
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginHorizontal: 22, marginVertical: 10, justifyContent: "space-between" },
  label: { fontFamily: "Montserrat_500Medium", fontSize: 18 },
  numberField: { borderBottomColor: palette.black, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 0 },
  number: { fontFamily: "Montserrat_500Medium", fontSize: 20, paddingLeft: 30 },
  unit: { fontFamily: "Montserrat_300Light", fontSize: 16, marginLeft: 18 },
  small: { fontFamily: "Montserrat_300Light", fontSize: 10 }
})

export default TaskOptionsItem
