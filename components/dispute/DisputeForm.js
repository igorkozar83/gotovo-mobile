// DisputeForm.js
// The dispute modal's content: its picture and title, the reason and the details, up to three photos
// and the button that opens the dispute.
import React from "react"
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import PhotoTiles from "../media/PhotoTiles"
import { SheetDivider } from "../sheets/SheetParts"
import { MAX_DISPUTE_PHOTOS } from "../../hooks/dispute/useDisputeForm"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"

const Field = ({ label, style, inputStyle, ...input }) => (
  <View style={style}>
    <Text style={styles.label}>{translate(label)}</Text>
    <TextInput accessibilityLabel={spokenLabel(label)} style={[styles.input, inputStyle]} {...input} />
  </View>
)

/**
 * form: from useDisputeForm; rowWidth: the width the photo tiles share
 * onFieldFocus(): a field got focus; raised: keep the button clear of the keyboard
 * onOpenPhoto(uri), onRemovePhoto(index), onAddPhoto(): the photo tiles
 */
const DisputeForm = ({ form, rowWidth, onFieldFocus, raised, onOpenPhoto, onRemovePhoto, onAddPhoto }) => (
  <>
    <View style={styles.centered}>
      <FastImageComponent style={styles.mainImage} source={require("../../assets/dispute.png")} />
    </View>
    <View style={styles.centered}>
      <Text accessibilityRole="header" style={styles.title}>
        {translate("disputeForm.pleaseExplainWhatWentWrong")}
      </Text>
    </View>
    <SheetDivider />
    <Field
      label={"common.reason"}
      style={styles.reason}
      inputStyle={styles.reasonInput}
      multiline={false}
      value={form.reason}
      onChangeText={form.setReason}
      onFocus={onFieldFocus}
    />
    <Field
      label={"disputeForm.explainInMoreDetail"}
      style={styles.detail}
      inputStyle={styles.detailInput}
      multiline={true}
      numberOfLines={4}
      value={form.detail}
      onChangeText={form.setDetail}
      onFocus={onFieldFocus}
    />
    <Text style={[styles.label, styles.detail]}>{translate("common.photos")}</Text>
    <PhotoTiles
      photos={form.photos}
      max={MAX_DISPUTE_PHOTOS}
      rowWidth={rowWidth}
      addIcon={<Feather name="plus-circle" size={32} color={palette.white} />}
      onOpen={onOpenPhoto}
      onRemove={onRemovePhoto}
      onAdd={onAddPhoto}
    />
    <Pressable android_ripple={{ color: palette.bluePale, borderless: false }} style={[styles.button, raised && styles.buttonRaised]} onPress={form.submit}>
      <Text style={styles.buttonText}>{translate("disputeForm.openDispute")}</Text>
      <FastImageComponent style={styles.buttonIcon} source={require("../../assets/disputesm.png")} />
    </Pressable>
  </>
)

const styles = StyleSheet.create({
  centered: { justifyContent: "center", alignItems: "center", marginTop: 30 },
  mainImage: { height: 70, aspectRatio: 1 },
  title: { fontSize: 22, fontFamily: "Montserrat_500Medium", color: palette.white, justifyContent: "center", alignItems: "center", textAlign: "center" },
  label: { fontFamily: "Montserrat_500Medium", fontSize: 12, color: palette.white, marginBottom: 5 },
  reason: { marginTop: 20 },
  reasonInput: { height: 40 },
  detail: { marginTop: 10 },
  detailInput: { height: 80 },
  input: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginBottom: 0,
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    backgroundColor: palette.gray100,
    textAlignVertical: "top",
    borderRadius: 5
  },
  button: {
    borderRadius: 5,
    elevation: 2,
    flexDirection: "row",
    minHeight: 42,
    backgroundColor: palette.red,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
    color: palette.white
  },
  buttonRaised: { marginBottom: 50 },
  buttonText: {
    width: "100%",
    color: palette.white,
    paddingLeft: 10,
    textAlignVertical: "center",
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    justifyContent: "center",
    textAlign: "center"
  },
  buttonIcon: { width: 16, height: 16, position: "absolute", right: 20, top: 14 }
})

export default DisputeForm
