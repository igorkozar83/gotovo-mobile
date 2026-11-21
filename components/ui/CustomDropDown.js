// CustomDropDown.js
// A grey field with the chosen value and a chevron; tapping lists the options under it, and choosing one
// tells callback(option).
import React, { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Entypo } from "@expo/vector-icons"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

// title: the chosen value (a translation key); options: the values to choose from
const CustomDropDown = ({ title, options, callback }) => {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)

  return (
    <View style={styles.container}>
      <Pressable onPress={toggle}>
        <Text style={styles.field}>{translate(title)}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={translate(title)} onPress={toggle}>
        <Entypo name="chevron-thin-down" size={24} color={palette.black} style={styles.chevron} />
      </Pressable>
      {open ? (
        <View style={styles.list}>
          {(options || []).map((option) => (
            <Pressable
              key={`custom-options-${option}`}
              onPress={() => {
                setOpen(false)
                callback(option)
              }}
            >
              <Text style={styles.option}>{translate(option)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { position: "relative", zIndex: 5 },
  field: { backgroundColor: palette.gray100, paddingLeft: 5, fontFamily: "Montserrat_500Medium", lineHeight: 32.5, fontSize: 16, height: 32.5 },
  chevron: { position: "absolute", zIndex: 3, bottom: 3, right: 10 },
  list: { width: "100%", backgroundColor: palette.gray350, position: "absolute", top: 33 },
  option: { paddingLeft: 5, paddingVertical: 5, borderBottomColor: palette.white, fontFamily: "Montserrat_500Medium", borderBottomWidth: 1 }
})

export default CustomDropDown
