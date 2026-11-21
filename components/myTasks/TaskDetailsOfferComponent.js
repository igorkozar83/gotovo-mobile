// TaskDetailsOfferComponent.js
// The other party's photo on a task's offer card, with their level ribbon and small badges (a client
// sees a tasker's badges, a tasker a client's).
import React from "react"
import { View, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { LevelRibbon, MiniBadges } from "../profile/UserLevelBadges"
import useAuthStore from "../../stores/authStore"
import { atoms } from "../../styles/atoms"
import { smallAvatar } from "../../Helpers/pictures"

const TaskDetailsOfferComponent = ({ reloadUser }) => {
  const me = useAuthStore((state) => state.user)
  const user = reloadUser()
  const set = me.userData.type === "CLIENT" ? "TASKER" : "CLIENT"

  return (
    <View style={atoms.width120}>
      <View style={styles.photoBlock}>
        <FastImageComponent contentFit="cover" source={smallAvatar(user)} style={styles.photo} />
        <LevelRibbon user={user} set={set} />
      </View>
      <MiniBadges user={user} set={set} style={atoms.marginTopMinus3} />
    </View>
  )
}

const styles = StyleSheet.create({
  photoBlock: { position: "relative", paddingHorizontal: 20, marginRight: 5 },
  photo: { width: 76, height: 76, borderRadius: 56 }
})

export default TaskDetailsOfferComponent
