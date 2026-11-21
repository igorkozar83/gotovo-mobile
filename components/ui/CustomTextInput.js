// CustomTextInput.js
// The forms' text field: a TextInput with the app's defaults (black placeholder, no Android underline,
// no scrolling inside it). accessibilityLabel: what a screen reader says for it (the placeholder when none).
import React from "react"
import { TextInput } from "react-native"
import { palette } from "../../styles/palette"

const CustomTextInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  editable = true,
  maxLength,
  style,
  placeholderTextColor = palette.black,
  scrollEnabled = false,
  accessibilityLabel = placeholder
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      scrollEnabled={scrollEnabled}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      secureTextEntry={secureTextEntry}
      editable={editable}
      maxLength={maxLength}
      placeholderTextColor={placeholderTextColor}
      underlineColorAndroid={palette.transparent}
      style={style}
    />
  )
}

export default CustomTextInput
