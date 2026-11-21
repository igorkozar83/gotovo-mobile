// CancelTaskTasker.js
// A tasker canceling a task they took: the client, the task and the agreed amount, and the reason.
import React, { useRef } from "react"
import { ScrollView, Platform, StyleSheet } from "react-native"

import GradientModal from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, Fact, SheetDivider } from "../sheets/SheetParts"
import { AmountField, ExplanationField } from "../offer/OfferFields"
import ButtonWithPicture from "../ui/ButtonWithPicture"
import useTaskerCancel, { acceptedOfferOf } from "../../hooks/myTasks/useTaskerCancel"
import useKeyboardVisible from "../../hooks/useKeyboardVisible"
import { localPriceFixed } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const CancelTaskTasker = ({ onClose, visible, taskDetails }) => {
  const user = useAuthStore((state) => state.user)
  const form = useTaskerCancel(taskDetails, onClose)
  const keyboardVisible = useKeyboardVisible()
  const scroll = useRef(null)
  const client = taskDetails.posted_by_user

  return (
    <GradientModal
      visible={visible}
      onClose={onClose}
      onRequestClose={onClose}
      closeStyle={styles.closeButton}
      outerStyle={atoms.paddingVertical20}
      cardStyle={keyboardVisible && Platform.OS === "ios" && { marginBottom: 10 }}
    >
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" ref={scroll}>
        <SheetIcon source={require("../../assets/cancelmodalbig.png")} />
        <SheetTitle>{"cancelTaskTasker.cancelTask"}</SheetTitle>
        <Fact label={"common.toClient"}>
          {client?.name} {client?.last_name}
        </Fact>
        <Fact label={"common.taskName"}>{taskDetails.name}</Fact>
        <SheetDivider thick gap={10} />
        <AmountField label={"cancelTaskTasker.amount"} value={localPriceFixed(parseInt(acceptedOfferOf(taskDetails).price))} />
        <ExplanationField
          label={"cancelTaskTasker.addReasonForCancelation"}
          value={form.reason}
          onChange={form.setReason}
          onFocus={() => setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 500)}
        />
        <ButtonWithPicture
          icon={user.userData.type === "CLIENT" ? require("../../assets/mytasksblue.png") : require("../../assets/exctasker1.png")}
          onPress={form.submit}
          backgroundColor={palette.white}
          text={translate("cancelTaskTasker.cancelTask")}
          textColor={palette.black}
          textSize={15}
        />
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: 5, top: 10 },
  content: { flexGrow: 1, borderRadius: 20, overflow: "hidden", padding: 20, paddingBottom: 15 }
})

export default CancelTaskTasker
