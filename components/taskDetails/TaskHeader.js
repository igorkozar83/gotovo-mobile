// TaskHeader.js
// The top of the task details: the job's picture with the title, and who posted the task.
import React from "react"
import { View, Text, ImageBackground, Pressable, Dimensions, StyleSheet } from "react-native"

import RatingStats from "../profile/RatingStats"
import FastImageComponent from "../media/FastImageComponent"
import ProfileBg from "../../assets/profilebg.png"
import { calcStars } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const SMALL_SCREEN = Dimensions.get("screen").width < 380

export const TaskHero = ({ task, userSelect }) => (
  <ImageBackground source={{ uri: userSelect === "CLIENT" ? task.sub_category_task.image : task.sub_category_task.image_task_details }} resizeMode="cover" style={styles.hero}>
    <Text style={styles.heroBold}>{translate(task.is_sos ? "taskHeader.sosTasktaskdetails" : "taskHeader.taskmytasks")}</Text>
    <Text style={[styles.heroLight, task.is_sos && { lineHeight: 35.5 }]}>{translate(task.is_sos ? "taskHeader.detailsmytaskssos" : "taskHeader.detailsmytasks")}</Text>
  </ImageBackground>
)

// onOpenProfile(): the poster's name and photo open their profile (as their picture in the feed does)
export const PosterSummary = ({ poster, avatar, onOpenProfile }) => (
  <View style={atoms.paddingHorizontal20}>
    <View style={styles.top}>
      <View style={atoms.marginTop10}>
        <Pressable disabled={!onOpenProfile} accessibilityRole={onOpenProfile ? "button" : undefined} onPress={onOpenProfile}>
          <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
            {poster.name} {poster.last_name ? poster.last_name.charAt(0) + "." : ""}
          </Text>
        </Pressable>
        <RatingStats stars={calcStars(poster)} average={calcStars(poster, 1)} count={poster.tasks_count} />
      </View>
      <View style={[styles.avatarBox, SMALL_SCREEN && { transform: [{ scale: 0.7 }], right: 20, top: -65 }]}>
        <Pressable
          disabled={!onOpenProfile}
          accessibilityRole={onOpenProfile ? "button" : undefined}
          accessibilityLabel={translate("taskHeader.clientProfile")}
          onPress={onOpenProfile}
        >
          <ImageBackground source={ProfileBg} resizeMode="cover" style={styles.avatarRing}>
            {avatar ? (
              <FastImageComponent contentFit="cover" source={avatar} style={styles.avatar} />
            ) : (
              <FastImageComponent contentFit="cover" source={require("../../assets/emptyavatar.png")} style={styles.avatar} />
            )}
          </ImageBackground>
        </Pressable>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between" },
  avatarBox: { position: "relative", top: -50 },
  hero: { width: "100%", height: undefined, aspectRatio: 2.3 },
  heroBold: { fontSize: 35.5, fontFamily: "Montserrat_700Bold", color: palette.white, marginBottom: 0, lineHeight: 40, marginTop: 70, left: 22, top: 8 },
  heroLight: { fontSize: 35.5, color: palette.white, fontFamily: "Montserrat_300Light", lineHeight: 40, zIndex: 99999, left: 22, top: 7 },
  name: { fontSize: 24, fontFamily: "Montserrat_600SemiBold", maxWidth: SMALL_SCREEN ? 170 : 180 },
  avatarRing: { width: 159, height: 159, alignItems: "center", justifyContent: "center" },
  avatar: { width: 141, height: 141, borderRadius: 159 }
})
