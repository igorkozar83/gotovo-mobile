// TaskerProfile.js
// Another user's profile (the tasker a client looks at, or the client a tasker looks at): who they are,
// their reviews by stars and the reviews themselves, sortable, with who replied.
import React, { useState } from "react"
import { View, Text, StyleSheet, ImageBackground } from "react-native"

import Header from "../components/Header"
import ImageFullScreen from "../components/media/ImageFullScreen"
import UserInfo from "../components/profile/UserInfo"
import RatingBreakdown from "../components/reviews/RatingBreakdown"
import ReviewList, { ReviewSortBar } from "../components/reviews/ReviewList"
import HeaderProfile from "../assets/profileclient.png"
import HeaderProfileOrange from "../assets/profiletasker.png"
import useReviewsPage from "../hooks/reviews/useReviewsPage"
import useAuthStore from "../stores/authStore"
import { calcStars } from "../Helpers"
import { translate } from "../Helpers/language.utils"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

// route.params.profile: the person shown (from the list or offer that opened it)
const TaskerProfile = ({ route }) => {
  const viewerType = useAuthStore((state) => state.user.userData.type)
  const profile = route.params.profile
  const viewerIsClient = viewerType === "CLIENT"
  // the viewed user's reviews as seen from the viewer's role
  const page = useReviewsPage({ userId: profile.id, userType: viewerType === "TASKER" ? 0 : 1 })
  const [image, setImage] = useState(null)

  return (
    <View style={[styles.container, atoms.backgroundColorWhite]}>
      <ReviewList
        reviews={page.reviews}
        fetching={page.fetching}
        canLoadMore={page.canLoadMore}
        onLoadMore={page.loadMore}
        onOpenImage={setImage}
        itemProps={(review) => ({ taskPostedBy: review.task.posted_by, postedBy: review.user_id, noReply: true, type: profile.type, taskerProfile: true })}
        header={
          <>
            <Header back transparent />
            <View style={styles.mainContent}>
              <ImageBackground source={viewerIsClient ? HeaderProfile : HeaderProfileOrange} resizeMode="cover" style={styles.image}>
                <Text style={styles.heroBold}>{translate(viewerIsClient ? "taskerProfile.tasker" : "taskerProfile.client")}</Text>
                <Text style={styles.heroLight}>{translate("common.profile")}</Text>
              </ImageBackground>
              <UserInfo stars={calcStars(profile, 1)} user={profile} countTasks={viewerIsClient ? profile.tasks_count_tasker : profile.tasks_count_client} type={viewerType} />
              <RatingBreakdown summary={profile.reviews} />
              <ReviewSortBar hasReviews={page.reviews.length > 0} keepBar onSort={page.setSort} />
            </View>
          </>
        }
      />
      <ImageFullScreen image={image} visible={!!image} onClose={() => setImage(null)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 2 },
  mainContent: { zIndex: 2 },
  image: { flex: 1, justifyContent: "center", height: 161, paddingLeft: 20 },
  heroBold: { fontSize: 35.5, fontFamily: "Montserrat_700Bold", color: palette.white, marginBottom: 0, lineHeight: 35.5, marginTop: 70 },
  heroLight: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", lineHeight: 35.5, zIndex: 99999 }
})

export default TaskerProfile
