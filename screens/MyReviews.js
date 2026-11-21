// MyReviews.js
// The user's own reviews: their summary (the avatar can be changed), the reviews by stars, and the
// reviews themselves, sortable, each with a reply.
import React, { useEffect, useState } from "react"
import { useIsFocused } from "@react-navigation/native"
import { View, Text, StyleSheet, Pressable, ImageBackground, Dimensions } from "react-native"

import Header from "../components/Header"
import FastImageComponent from "../components/media/FastImageComponent"
import ImageFullScreen from "../components/media/ImageFullScreen"
import ProfilePictureModal from "../components/profile/ProfilePictureModal"
import RatingStats from "../components/profile/RatingStats"
import ReplyReview from "../components/modals/ReplyReview"
import UserBadges from "../components/profile/UserBadges"
import RatingBreakdown from "../components/reviews/RatingBreakdown"
import ReviewList, { ReviewSortBar } from "../components/reviews/ReviewList"
import HeaderProfile from "../assets/profileheader.png"
import HeaderProfileOrange from "../assets/profileheaderorange.png"
import ProfileBg from "../assets/profilebg.png"
import useProfileActions from "../hooks/profile/useProfileActions"
import useReviewsPage from "../hooks/reviews/useReviewsPage"
import useReloadUser from "../hooks/useReloadUser"
import useEvent from "../hooks/useEvent"
import useAuthStore from "../stores/authStore"
import { calcStars } from "../Helpers"
import { translate } from "../Helpers/language.utils"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

const SMALL_SCREEN = Dimensions.get("screen").width < 380

const OwnSummary = ({ user, onAvatar }) => (
  <View style={styles.top}>
    <View style={atoms.marginTop10}>
      <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
        {user.name}
      </Text>
      <Text style={[styles.name, atoms.lineHeight28]} ellipsizeMode="tail" numberOfLines={1}>
        {user.last_name}
      </Text>
      <RatingStats stars={calcStars(user, 0)} average={calcStars(user, 1)} count={user.tasks_count} />
    </View>
    <View style={[styles.avatarBox, SMALL_SCREEN && { transform: [{ scale: 0.7 }], right: 25, top: -58 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={translate("myReviews.profilePicture")} onPress={onAvatar}>
        <ImageBackground source={ProfileBg} resizeMode="cover" style={styles.avatarRing}>
          <FastImageComponent source={user.avatar} style={styles.avatar} />
        </ImageBackground>
        <FastImageComponent style={styles.editIcon} source={require("../assets/changefoto.png")} />
      </Pressable>
    </View>
  </View>
)

const MyReviews = () => {
  const user = useAuthStore((state) => state.user.userData)
  const userSelect = useAuthStore((state) => state.userSelect)
  const focused = useIsFocused()
  const page = useReviewsPage({}, focused)

  // the summary on top (stars, tasks done, reviews by stars) comes with the profile: it is loaded again on
  // every visit and whenever the reviews below change, so the two never tell a different count
  const reloadUser = useReloadUser()
  const refreshSummary = useEvent(() => reloadUser())
  useEffect(() => {
    if (focused) refreshSummary()
  }, [focused, page.reviews, refreshSummary])

  const [pictureOpen, setPictureOpen] = useState(false)
  const [reply, setReply] = useState(null)
  const [image, setImage] = useState(null)
  const { getUser, doDeleteAvatar } = useProfileActions({ onAvatarDeleted: () => setPictureOpen(false) })
  const accent = user.type !== "CLIENT" ? palette.orange : palette.blueDark

  return (
    <View style={[styles.container, styles.screen]}>
      <ReviewList
        reviews={page.reviews}
        fetching={page.fetching}
        canLoadMore={page.canLoadMore}
        onLoadMore={page.loadMore}
        onOpenImage={setImage}
        itemProps={(review) => ({
          type: user.type,
          // (the reply names the reviewer in full: the list shows the first name only)
          openReply: (item) =>
            setReply({ userName: review.user?.full_name || item.reviewer, taskName: item.taskName, message: item.reviewDescription, rate: item.taskRating, taskId: item.id })
        })}
        header={
          <>
            <Header back transparent />
            <View style={styles.content}>
              <ImageBackground source={userSelect === "CLIENT" ? HeaderProfile : HeaderProfileOrange} resizeMode="cover" style={styles.image}>
                <Text style={styles.heroBold}>{translate("myReviews.reviewstopbar")}</Text>
                <Text style={styles.heroLight}>{translate("myReviews.reviews2")}</Text>
              </ImageBackground>
              <View style={atoms.paddingHorizontal20}>
                <OwnSummary user={user} onAvatar={() => setPictureOpen(!pictureOpen)} />
                <UserBadges user={user} role={userSelect === "TASKER" ? "TASKER" : "CLIENT"} count={user.tasks_count} />
                <View style={{ width: "100%", borderBottomColor: accent, borderBottomWidth: 2 }}>
                  <Text accessibilityRole="header" style={[styles.sectionTitle, { color: accent }]}>
                    {translate("myReviews.reviews")}
                  </Text>
                </View>
              </View>
              <RatingBreakdown summary={user.reviews} />
              <ReviewSortBar hasReviews={page.reviews.length > 0} onSort={page.setSort} />
            </View>
          </>
        }
      />
      <ProfilePictureModal visible={pictureOpen} onClose={() => setPictureOpen(false)} reloadUser={getUser} deleteAvatar={doDeleteAvatar} />
      <ReplyReview onClose={() => setReply(null)} visible={!!reply} data={reply || {}} type={user.type} />
      <ImageFullScreen visible={!!image} onClose={() => setImage(null)} image={image} />
    </View>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between" },
  avatarBox: { position: "relative", top: -50 },
  screen: { minHeight: "100%", flex: 1, backgroundColor: palette.white },
  content: { zIndex: 2, backgroundColor: palette.white },
  editIcon: { position: "absolute", top: 18, right: 0 },
  container: { flex: 1, zIndex: 2 },
  image: { flex: 1, justifyContent: "center", height: 161, paddingLeft: 20 },
  heroBold: { fontSize: 35.5, fontFamily: "Montserrat_700Bold", color: palette.white, marginBottom: 0, marginTop: 70 },
  heroLight: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", zIndex: 15 },
  name: { fontSize: 28, fontFamily: "Montserrat_600SemiBold", maxWidth: 160 },
  avatarRing: { width: 159, height: 159, alignItems: "center", justifyContent: "center" },
  avatar: { width: 141, height: 141, borderRadius: 159 },
  sectionTitle: { textAlign: "center", marginBottom: 5, fontFamily: "Montserrat_600SemiBold", fontSize: 16 }
})

export default MyReviews
