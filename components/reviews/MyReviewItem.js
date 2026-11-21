// MyReviewItem.js
// A review: who wrote it and when, the task, the stars and the message, its photos (children), and the
// reply (or, where replying is allowed, a link to reply).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import StarRow from "./StarRow"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

/**
 * openReply(props): opens the reply form (not with noReply); repliedText / repliedDate: the reply
 * taskerProfile: seen on someone's profile (the reply is named by who wrote it: postedBy vs taskPostedBy)
 */
const MyReviewItem = (props) => {
  const { reviewer, dateReview, taskName, taskRating, reviewDescription, children, repliedText, repliedDate, noReply, taskerProfile, postedBy, taskPostedBy } = props
  return (
    <View style={atoms.width100Percent}>
      <View style={styles.spread}>
        <Text style={[styles.bold, atoms.maxWidth180]} ellipsizeMode="tail" numberOfLines={1}>
          {reviewer}
        </Text>
        <Text style={styles.small}>{dateReview}</Text>
      </View>
      <Text style={styles.small}>{taskName}</Text>
      <View style={styles.item}>
        <StarRow value={taskRating} size={24} />
      </View>
      <Text style={styles.text}>{reviewDescription}</Text>
      <View style={atoms.flexDirectionRow}>{children}</View>
      <View style={atoms.marginVertical10}>
        {!repliedText && !noReply ? (
          <Pressable onPress={() => props.openReply(props)}>
            <Text style={[styles.bold, atoms.textAlignCenter]}>{translate("myReviewItem.wishToReplyToThisReview")}</Text>
          </Pressable>
        ) : null}
        {repliedText ? (
          <>
            <View style={[styles.spread, atoms.marginVertical10]}>
              <Text style={styles.bold}>
                {translate(!taskerProfile ? "myReviewItem.yourReply" : postedBy === taskPostedBy ? "myReviewItem.taskerReply" : "myReviewItem.clientReply")}
              </Text>
              <Text style={styles.small}>{repliedDate}</Text>
            </View>
            <Text style={[styles.text, atoms.marginVertical10]}>{repliedText}</Text>
          </>
        ) : null}
      </View>
      <View style={styles.separator}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: { width: "100%", marginVertical: 10 },
  separator: { width: "100%", height: 2, backgroundColor: palette.gray100, marginVertical: 10 },
  spread: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bold: { fontFamily: "Montserrat_700Bold", fontSize: 16 },
  small: { fontFamily: "Montserrat_300Light", fontSize: 13 },
  text: { fontFamily: "Montserrat_300Light", fontSize: 18 }
})

export default MyReviewItem
