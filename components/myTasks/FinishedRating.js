// FinishedRating.js
// Under a finished task: the user's review of the other party, or the form to write it (stars, a
// message, up to two photos). A saved review is confirmed with a badge; closing it refreshes the task.
import React, { useState } from "react"
import { View, Text, TextInput, Dimensions, StyleSheet } from "react-native"
import { Entypo, Feather } from "@expo/vector-icons"

import ModalBadge from "../sheets/ModalBadge"
import WideButton from "../ui/WideButton"
import StarRow from "../reviews/StarRow"
import PhotoTiles from "../media/PhotoTiles"
import PhotoPrompts, { usePhotoPrompts } from "../media/PhotoPrompts"
import useReviewDraft, { MAX_REVIEW_PHOTOS } from "../../hooks/reviews/useReviewDraft"
import useAlert from "../../hooks/useAlert"
import useUiStore from "../../stores/uiStore"
import { getFinishedOffer, getUserReview } from "../../Helpers/taskStatus"
import { reviewStars } from "../../Helpers/reviews"
import { dateDotTime } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const ROW = Dimensions.get("screen").width - 44

const badgeFor = (userSelect) => ({
  image: userSelect === "CLIENT" ? "https://app.gotovo.rs/images/okbadge.png" : "https://app.gotovo.rs/images/checktasker.png",
  title: translate("finishedRating.yourReviewHasBeenSubmitted"),
  text: "",
  type: userSelect === "CLIENT" ? "client" : "tasker"
})

// the review the user already wrote (the first star always shows)
const WrittenReview = ({ review, color, language }) => (
  <>
    <View style={styles.reviewTitle}>
      <Text accessibilityRole="header" style={[styles.title, { color }]}>
        {translate("finishedRating.yourReview")}
      </Text>
    </View>
    <View style={styles.review}>
      <StarRow value={Math.max(1, reviewStars(review) || 0)} emptyColor={palette.gray400} style={atoms.marginBottom20} />
      <Text style={styles.reviewText}>{review.message}</Text>
      <Text style={styles.reviewDate}>{dateDotTime(review.created_at, language)}</Text>
    </View>
  </>
)

const FinishedRating = ({ task, userSelect, onReviewSubmitted }) => {
  const user = useAuthStore((state) => state.user)
  const language = useUiStore((state) => state.language)
  const { showError } = useAlert()

  const [badgeOpen, setBadgeOpen] = useState(false)
  const prompts = usePhotoPrompts()

  const receiverId = getFinishedOffer(task).user_id
  const review = getUserReview(task, user.userData.id)
  const draft = useReviewDraft({ taskId: task.id, receiverId, onSaved: () => setBadgeOpen(true) })

  const submit = () => {
    const problems = draft.problems()
    if (problems) return showError("common.taskReviewCreateError", problems)
    draft.send()
  }

  if (review) return <WrittenReview review={review} color={userSelect === "CLIENT" ? palette.blue : palette.orange} language={language} />
  if (!receiverId) return null

  return (
    <>
      <View style={styles.block}>
        <Text accessibilityRole="header" style={styles.blockTitle}>
          {userSelect === "CLIENT"
            ? translate("finishedRating.pleaseShareWithOthersWhatWasYourExperienceLikeWithThisTasker")
            : translate("finishedRating.pleaseShareWithOthersWhatWasYourExperienceLikeWithThisClient")}
        </Text>
      </View>
      <StarRow value={draft.rate} onRate={draft.setRate} style={atoms.marginBottom20} />
      <View style={atoms.paddingHorizontal20}>
        <Text style={styles.label}>{translate("finishedRating.myReview")}</Text>
        <View style={atoms.positionRelative}>
          <TextInput
            accessibilityLabel={spokenLabel("finishedRating.myReview")}
            numberOfLines={4}
            style={styles.input}
            value={draft.message}
            blurOnSubmit
            autoCorrect={false}
            multiline={true}
            onChangeText={draft.setMessage}
          />
          <Entypo name="triangle-right" size={24} color={palette.gray350} style={styles.corner} />
        </View>
        <Text style={[styles.label, styles.photosLabel]}>{translate("common.photos")}</Text>
        <PhotoTiles
          photos={draft.photos}
          max={MAX_REVIEW_PHOTOS}
          rowWidth={ROW}
          height={85}
          addIcon={<Feather name="plus-circle" size={32} color={palette.white} />}
          style={atoms.marginBottom0}
          onOpen={prompts.preview}
          onRemove={prompts.remove}
          onAdd={prompts.pick}
        />
        <WideButton
          text={translate("finishedRating.submitReview")}
          onPress={submit}
          color={userSelect === "CLIENT" ? palette.blue : palette.gray600}
          style={atoms.marginTop10}
          textStyle={atoms.fontSize18}
          icon={require("../../assets/icon3.png")}
          iconStyle={{ right: "7%", aspectRatio: 77 / 73, width: 18, height: 18 }}
        />
      </View>
      <PhotoPrompts prompts={prompts} photos={draft.photos} onPick={draft.addPhoto} onRemove={draft.removePhoto} pickerProps={{ onlyImages: true }} />
      <ModalBadge
        visible={badgeOpen}
        onClose={() => {
          draft.clear()
          setBadgeOpen(false)
          onReviewSubmitted()
        }}
        badge={badgeFor(userSelect)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  block: { marginBottom: 20, paddingHorizontal: 20 },
  blockTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 16 },
  reviewTitle: { paddingHorizontal: 20, marginBottom: 5, marginTop: 30 },
  review: { padding: 20, backgroundColor: palette.gray100, marginBottom: 20 },
  reviewText: { fontFamily: "Montserrat_300Light", fontSize: 18, marginBottom: 20 },
  reviewDate: { fontSize: 13, fontFamily: "Montserrat_300Light", textAlign: "right" },
  photosLabel: { color: palette.charcoal, marginTop: 22, marginBottom: 5 },
  title: { fontSize: 12, fontFamily: "Montserrat_700Bold" },
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  input: { backgroundColor: palette.gray100, padding: 10, paddingLeft: 5, fontSize: 16, fontFamily: "Montserrat_500Medium", textAlignVertical: "top", height: 80 },
  corner: { position: "absolute", bottom: -3, right: -3, transform: [{ rotateZ: "40deg" }] }
})

export default FinishedRating
