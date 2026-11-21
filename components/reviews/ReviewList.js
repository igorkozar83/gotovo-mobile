// ReviewList.js
// Reviews with their pictures (a picture opens full screen), sortable: newest, oldest, best, worst, in a
// list under the screen's top (more loaded near its end).
// itemProps(review) adds what the screen needs (replying to own reviews, or who replied on a profile).
import React from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"

import MyReviewItem from "./MyReviewItem"
import SortDropDown from "./SortDropDown"
import FastImageComponent from "../media/FastImageComponent"
import useUiStore from "../../stores/uiStore"
import { timeFormatFullYear } from "../../Helpers"
import { reviewStars, reviewerName } from "../../Helpers/reviews"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { smallPicture } from "../../Helpers/pictures"

const SORTS = ["Newest", "Oldest", "Best rating", "Worst rating"]

// the sort menu (keepBar: the bar's line stays when there are no reviews)
export const ReviewSortBar = ({ hasReviews, keepBar, onSort }) =>
  hasReviews || keepBar ? (
    <View style={styles.sortBar}>
      {hasReviews ? (
        <View style={styles.sortPicker}>
          <SortDropDown options={SORTS} onSelect={onSort} />
        </View>
      ) : null}
    </View>
  ) : null

const ReviewImages = ({ images, onOpen }) =>
  images && images.length ? (
    <View style={styles.reviewRow}>
      {images.map((image, index) => (
        <Pressable accessibilityRole="button" accessibilityLabel={translate("common.openPhoto")} key={`review-image-${index}`} onPress={() => onOpen(image.url)}>
          <FastImageComponent source={smallPicture(image)} style={styles.photo} />
        </Pressable>
      ))}
    </View>
  ) : null

/**
 * reviews, fetching, canLoadMore, onLoadMore: the list; header: what scrolls above it (the screen's top
 * and the sort bar); onOpenImage(url): shows a picture full screen
 */
const ReviewList = ({ reviews, header, fetching, canLoadMore, onLoadMore, onOpenImage, itemProps }) => {
  const language = useUiStore((state) => state.language)
  return (
    <FlashList
      bounces={false}
      showsHorizontalScrollIndicator={false}
      data={reviews}
      extraData={[language, itemProps]}
      keyExtractor={(review, index) => String(review.id ?? "review-" + index)}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      onEndReached={() => {
        if (canLoadMore && !fetching && onLoadMore) onLoadMore()
      }}
      onEndReachedThreshold={0.5}
      renderItem={({ item: review }) => (
        <View style={styles.row}>
          <MyReviewItem
            reviewer={reviewerName(review.user)}
            dateReview={timeFormatFullYear(review.created_at, language)}
            taskName={review.task.name}
            taskRating={reviewStars(review)}
            reviewDescription={review.message}
            id={review.task.id}
            repliedText={review.reply ? review.reply.reply : null}
            repliedDate={review.reply ? timeFormatFullYear(review.reply.created_at, language) : null}
            {...itemProps(review)}
          >
            <ReviewImages images={review.review_images} onOpen={onOpenImage} />
          </MyReviewItem>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  sortPicker: { width: 200 },
  reviewRow: { flexDirection: "row", marginTop: 10 },
  sortBar: { borderBottomColor: palette.gray700, borderBottomWidth: 2, padding: 10, marginBottom: 20, flexDirection: "row", justifyContent: "flex-end" },
  photo: { width: 116, height: 88.5, borderRadius: 10, marginRight: 5 },
  list: { paddingBottom: 100 },
  row: { paddingHorizontal: 20 }
})

export default ReviewList
