// SubmitReviewPopup.js
// Reviewing the other party of a finished task: stars, a message and up to two photos. The popup steps
// aside for the photo picker, a full-screen photo and the remove confirmation, and comes back after them
// (closeSubmitReviewPopup(false) hides it, (true) shows it again).
import React, { useRef } from "react"
import { StyleSheet, View, Text, TextInput, Dimensions, ScrollView } from "react-native"
import { Ionicons, FontAwesome } from "@expo/vector-icons"

import Button from "../ui/Button"
import StarRow from "../reviews/StarRow"
import AutoImage from "../media/AutoImage"
import PhotoTiles from "../media/PhotoTiles"
import PhotoPrompts, { usePhotoPrompts } from "../media/PhotoPrompts"
import useReviewForm, { MAX_REVIEW_PHOTOS } from "../../hooks/reviews/useReviewForm"
import useKeyboardVisible from "../../hooks/useKeyboardVisible"
import { translate } from "../../Helpers/language.utils"
import GradientModal from "../sheets/GradientModal"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const ROW = Dimensions.get("screen").width - 94

const Label = ({ children, bold }) => <Text style={[styles.label, bold && { fontFamily: "Montserrat_700Bold" }]}>{children}</Text>

const SubmitReviewPopup = ({ onClose, visible, data, type }) => {
  const hide = () => onClose(false)
  const show = () => onClose(true)
  const form = useReviewForm({ data, hide, show })
  const keyboardVisible = useKeyboardVisible()
  const scroll = useRef(null)
  // the reviewer's side: a client (blue) reviews the tasker, a tasker (orange) the client; data.userName is the
  // one reviewed (data.type is the reviewer's role, or the notification's type when it came from a review received)
  const byClient = type === "CLIENT" || (data && data.type === "CLIENT")
  const colors = byClient ? [palette.blueDark, palette.blue] : [palette.orangeDeep, palette.orange]

  const prompts = usePhotoPrompts()

  // the picker opens once the popup is gone, and the popup comes back after it (a moment later)
  const openPicker = () => {
    hide()
    setTimeout(prompts.pick, 120)
  }
  const onPromptClosed = (kind) => (kind === "pick" ? setTimeout(show, 500) : show())

  return (
    <>
      <GradientModal visible={visible} colors={colors} onClose={hide} closeStyle={styles.closeBtn} outerStyle={styles.backdrop}>
        <ScrollView
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.content, keyboardVisible && { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
          ref={scroll}
        >
          <View style={styles.iconBlock}>
            <AutoImage source={require("../../assets/submiticon.png")} style={styles.logo} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {translate("submitReviewPopup.submitReview")}
          </Text>
          <View style={atoms.marginBottom20}>
            <Label>{byClient ? translate("common.tasker") : translate("common.client")}</Label>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {data && data.userName}
            </Text>
          </View>
          <Label>{translate("common.taskName")}</Label>
          <Text style={styles.value}>{data && data.taskName}</Text>
          <View style={styles.titleBlock}>
            <StarRow value={form.rate} onRate={form.setRate} size={32} style={atoms.justifyContentFlexStart} />
          </View>
          <View style={atoms.marginBottom20}>
            <Label bold>{translate("submitReviewPopup.yourReview")}</Label>
            <TextInput
              accessibilityLabel={spokenLabel("submitReviewPopup.yourReview")}
              value={form.message}
              multiline={true}
              numberOfLines={4}
              style={styles.input}
              onChangeText={form.setMessage}
              onFocus={() => setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 100)}
            />
          </View>
          <Label bold>{translate("common.photos")}</Label>
          <PhotoTiles
            photos={form.photos}
            max={MAX_REVIEW_PHOTOS}
            rowWidth={ROW}
            height={85}
            gapBelow={10}
            addBackground={palette.gray100}
            addIcon={<Ionicons name="add-circle-outline" size={34} color={palette.white} />}
            onOpen={(uri) => {
              hide()
              prompts.preview(uri)
            }}
            onRemove={(index) => {
              hide()
              prompts.remove(index)
            }}
            onAdd={openPicker}
          />
          <Button onPress={form.submit} background={palette.white} textColor={palette.black} title={"submitReviewPopup.submitReview"}>
            <FontAwesome name="star-o" size={20} color={palette.blueDark} />
          </Button>
        </ScrollView>
      </GradientModal>
      <PhotoPrompts prompts={prompts} photos={form.photos} onPick={form.addPhoto} onRemove={form.removePhoto} onClosed={onPromptClosed} pickerProps={{ onlyImages: true }} />
    </>
  )
}

const styles = StyleSheet.create({
  logo: { maxHeight: 60, width: "100%" },
  content: { borderRadius: 20, overflow: "hidden", padding: 16 },
  iconBlock: { justifyContent: "center", alignItems: "center", marginTop: 20, height: 80 },
  titleBlock: { justifyContent: "center", alignItems: "center", marginVertical: 10 },
  backdrop: { paddingTop: 40, paddingBottom: 20, width: "100%" },
  closeBtn: { zIndex: 10, right: "3%", top: "3%" },
  title: { fontSize: 24, textAlign: "center", fontFamily: "Montserrat_500Medium", marginVertical: 20, color: palette.white },
  label: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: palette.white, marginBottom: 5 },
  value: { fontFamily: "Montserrat_600SemiBold", fontSize: 20, color: palette.white },
  input: {
    height: 80,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginBottom: 0,
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    backgroundColor: palette.gray100,
    textAlignVertical: "top",
    borderRadius: 5
  }
})

export default SubmitReviewPopup
