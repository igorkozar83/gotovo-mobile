// DropdownMenu.js
// A small menu opened next to a button: its options, the chosen one highlighted. Choosing an option or
// tapping outside closes it.
import React from "react"
import { View, Text, Pressable, Modal, TouchableWithoutFeedback, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

/**
 * position: where the menu box sits in the window ({ left, top } or { right, top })
 * options: [{ value, label }] (labels are translated); selected: the chosen value
 */
const DropdownMenu = ({ visible, onClose, position, options, selected, onSelect }) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={atoms.flex1}>
        <View style={[styles.menu, position]}>
          {options.map((option) => (
            <Pressable
              key={String(option.value)}
              onPress={() => {
                onSelect(option.value)
                onClose()
              }}
            >
              <Text style={[styles.option, option.value === selected && styles.selected]}>{translate(option.label)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
)

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    backgroundColor: palette.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  option: { color: palette.gray600, fontSize: 16, fontFamily: "Montserrat_400Regular", paddingVertical: 4 },
  selected: { backgroundColor: palette.gray100 }
})

export default DropdownMenu
