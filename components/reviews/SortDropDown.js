// SortDropDown.js
// The reviews' order: a grey pill with the chosen order; it turns dark and opens the orders under it (in
// the window, over whatever lies below). Choosing one tells onSelect(option).
import React, { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Entypo } from "@expo/vector-icons"

import DropdownMenu from "../ui/DropdownMenu"
import useWindowLayout from "../../hooks/useWindowLayout"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

// options: the orders (translation keys; the first one is chosen at start)
const SortDropDown = ({ options, onSelect }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(options[0])
  const [layout, onLayout, measure] = useWindowLayout()

  return (
    <View onLayout={onLayout}>
      <Pressable accessibilityRole="button" style={[styles.pill, open && styles.pillOpen]} onPress={() => measure(() => setOpen(true))}>
        <Text style={[styles.chosen, open && styles.chosenOpen]}>{translate(selected)}</Text>
        <Entypo name={open ? "chevron-thin-up" : "chevron-thin-down"} size={18} color={open ? palette.white : palette.gray600} style={styles.chevron} />
      </Pressable>
      <DropdownMenu
        visible={open}
        onClose={() => setOpen(false)}
        position={{ left: layout.x, top: layout.y + layout.height + 4, width: layout.width }}
        options={options.map((option) => ({ value: option, label: option }))}
        selected={selected}
        onSelect={(option) => {
          setSelected(option)
          onSelect(option)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { borderColor: palette.gray600, borderWidth: 2, borderRadius: 15 },
  pillOpen: { backgroundColor: palette.gray600 },
  chosen: { paddingLeft: 10, fontFamily: "Montserrat_500Medium", fontSize: 14, color: palette.gray600 },
  chosenOpen: { color: palette.white },
  chevron: { position: "absolute", right: 10 }
})

export default SortDropDown
