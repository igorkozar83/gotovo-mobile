// UserInfo.js
// The top of a profile: the name (a last initial on others' profiles), stars, completed tasks, the photo
// (tappable on one's own) and the badges of the role the viewer looks at.
import React from "react"

import ProfileBg from "../../assets/profilebg.png"
import RatingStats from "./RatingStats"
import FastImageComponent from "../media/FastImageComponent"

import { View, Text, ImageBackground, Pressable, StyleSheet } from "react-native"
import UserBadges from "./UserBadges"
import { translate } from "../../Helpers/language.utils"
import { atoms } from "../../styles/atoms"

// onOpenProfile(): another user's name and photo open their profile (as their picture in a list does)
const UserInfo = ({ stars, user, countTasks, type, isOwnProfile, onEditPicture, onOpenProfile }) => {
  const opensProfile = !isOwnProfile && !!onOpenProfile
  return (
    <View style={atoms.paddingHorizontal20}>
      <View style={styles.top}>
        <View style={atoms.marginTop10}>
          <Pressable disabled={!opensProfile} accessibilityRole={opensProfile ? "button" : undefined} onPress={onOpenProfile}>
            <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
              {user && user.last_name && (!isOwnProfile ? user.last_name.charAt(0) + "." : user.last_name)}
            </Text>
          </Pressable>
          <RatingStats stars={stars} average={stars} count={countTasks} compact />
        </View>
        <View style={[styles.avatar]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate(opensProfile ? "common.profile" : "userInfo.profilePicture")}
            onPress={() => {
              if (isOwnProfile) onEditPicture(true)
              else if (onOpenProfile) onOpenProfile()
            }}
          >
            <ImageBackground source={ProfileBg} resizeMode="cover" style={styles.avatarRingBox}>
              <FastImageComponent source={user.avatar ? { uri: user.avatar } : require("../../assets/emptyavatar.png")} style={styles.avatarImage} />
              {isOwnProfile ? <FastImageComponent style={styles.editIcon} source={require("../../assets/changefoto.png")} /> : null}
            </ImageBackground>
          </Pressable>
        </View>
      </View>
      {/* a client looks at a tasker's badges, a tasker at a client's */}
      {type === "CLIENT" && user ? <UserBadges user={user} role="TASKER" count={user.tasks_count_tasker} variant="profile" /> : null}
      {type === "TASKER" ? <UserBadges user={user} role="CLIENT" count={user.tasks_count_client} variant="profile" /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between" },
  avatar: { position: "relative", top: -50 },
  name: { fontSize: 24, fontFamily: "Montserrat_600SemiBold", maxWidth: 150 },
  avatarRingBox: { width: 149, height: 149, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 131, height: 131, borderRadius: 159 },
  editIcon: { position: "absolute", top: 18, right: 0, width: 35, height: 35 }
})

export default UserInfo
