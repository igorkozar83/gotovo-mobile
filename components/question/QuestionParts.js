// QuestionParts.js
// The pieces of the question modals: the text box (question or answer) and the one picture that can go
// with it (an add tile, or the picture with an X).
import React from "react"
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel, HIT_SLOP } from "../../Helpers/accessibility"

export const QuestionField = ({ label, value, onChange, onFocus, onBlur, onLayout, numberOfLines = 6, style }) => (
  <View style={style} onLayout={onLayout}>
    <Text style={styles.label}>{translate(label)}</Text>
    <TextInput
      accessibilityLabel={spokenLabel(label)}
      value={value}
      onChangeText={onChange}
      multiline={true}
      numberOfLines={numberOfLines}
      style={styles.input}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </View>
)

export const SinglePicture = ({ image, onAdd, onRemove, style, addStyle }) => (
  <>
    <Text style={styles.label}>{translate("questionParts.addPicture")}</Text>
    <View style={[styles.row, style]}>
      {!image ? (
        <Pressable accessibilityRole="button" accessibilityLabel={translate("common.addPhoto")} style={[styles.tile, addStyle]} onPress={onAdd}>
          <Ionicons name="add-circle-outline" size={34} color={palette.gray350} />
        </Pressable>
      ) : (
        <View style={styles.tile}>
          <FastImageComponent source={{ uri: image.uri }} style={styles.photo} />
          <Pressable accessibilityRole="button" accessibilityLabel={translate("common.removePhoto")} hitSlop={HIT_SLOP} onPress={onRemove} style={styles.remove}>
            <Ionicons name="close" size={22} color={palette.white} />
          </Pressable>
        </View>
      )}
    </View>
  </>
)

const styles = StyleSheet.create({
  photo: { width: 117, height: 89, borderRadius: 5 },
  label: { fontFamily: "Montserrat_700Bold", fontSize: 12, color: palette.white, marginBottom: 5 },
  input: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginBottom: 0,
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    backgroundColor: palette.gray100,
    textAlignVertical: "top",
    borderRadius: 5,
    height: 80
  },
  row: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap" },
  tile: { alignItems: "center", justifyContent: "center", backgroundColor: palette.gray100, marginBottom: 0.5, width: 117, height: 89, borderRadius: 5 },
  remove: { position: "absolute", top: "3%", right: "3%", zIndex: 20, backgroundColor: palette.inkShadow, borderRadius: 30 }
})
