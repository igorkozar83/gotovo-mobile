// TaskDisputeModal.js
// The client explains what went wrong with a task (reason, details, up to three photos) and opens a
// dispute. Only one modal shows at a time: this one steps aside for the photo picker, a full-screen
// photo and the remove confirmation, and comes back after them (onVisibleChange / onShow).
// (The ways into it are switched off in TaskActions and TaskCompleteConfirmModal.)
import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, ScrollView } from "react-native"

import DisputeForm from "../dispute/DisputeForm"
import GradientModal from "../sheets/GradientModal"
import PhotoPrompts, { usePhotoPrompts } from "../media/PhotoPrompts"
import useDisputeForm from "../../hooks/dispute/useDisputeForm"
import useChatKeyboard from "../../hooks/chat/useChatKeyboard"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"

const TaskDisputeModal = ({ data, visible, onClose, onShow, onHide, onSubmitted, onVisibleChange }) => {
  const userType = useAuthStore((state) => state.user.userData.type)
  const colors = userType === "CLIENT" ? [palette.blueDark, palette.blue] : [palette.orangeDark, palette.orange]
  const form = useDisputeForm({ data, hide: onHide, show: onShow, onSubmitted })

  const scroll = useRef(null)
  const keyboard = useChatKeyboard(() => {})
  // focuses since the keyboard opened: the first one keeps the button clear of the keyboard
  const [focuses, setFocuses] = useState(0)
  useEffect(() => {
    if (!keyboard.open) setFocuses(0)
  }, [keyboard.open])
  const onFieldFocus = () => {
    setFocuses((count) => count + 1)
    setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 100)
  }

  const [rowWidth, setRowWidth] = useState(0)
  const prompts = usePhotoPrompts()

  // a photo prompt takes the screen, then this modal comes back (onShow)
  const openPrompt = (open, ...args) => {
    onVisibleChange(false)
    open(...args)
  }

  return (
    <>
      <GradientModal
        visible={visible}
        onRequestClose={onClose}
        colors={colors}
        onClose={onClose}
        closeStyle={[styles.closeBtn, keyboard.open && styles.closeRaised]}
        outerStyle={styles.backdrop}
        avoidingStyle={keyboard.open && styles.avoidingOpen}
        cardStyle={[styles.card, keyboard.open && styles.cardFlat]}
        onCardLayout={(event) => setRowWidth(event.nativeEvent.layout.width - 44)}
        shadow="soft"
      >
        <ScrollView scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" ref={scroll}>
          <DisputeForm
            form={form}
            rowWidth={rowWidth}
            onFieldFocus={onFieldFocus}
            raised={keyboard.open && focuses < 2}
            onOpenPhoto={(uri) => openPrompt(prompts.preview, uri)}
            onRemovePhoto={(index) => openPrompt(prompts.remove, index)}
            onAddPhoto={() => form.canAddPhoto() && openPrompt(prompts.pick)}
          />
        </ScrollView>
      </GradientModal>
      <PhotoPrompts prompts={prompts} photos={form.photos} onPick={form.addPhoto} onRemove={form.removePhoto} onClosed={onShow} pickerProps={{ onlyImages: true }} />
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: { paddingVertical: 20 },
  avoidingOpen: { paddingBottom: 50 },
  card: { marginVertical: 20, marginHorizontal: 20 },
  cardFlat: { marginVertical: 0, marginHorizontal: 0 },
  closeBtn: { right: 5, top: 10, zIndex: 2 },
  closeRaised: { top: 20 },
  content: { borderRadius: 20, overflow: "hidden", padding: 25 }
})

export default TaskDisputeModal
