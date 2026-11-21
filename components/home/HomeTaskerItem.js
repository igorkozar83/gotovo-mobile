// HomeTaskerItem.js
// An open task on the tasker's Home: the client's photo (opening their profile) with their ribbon and
// badges, when it was posted, its name, the client, their stars and task count. S.O.S. tasks are orange.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { FontAwesome, Entypo } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import { LevelRibbon, MiniBadges } from "../profile/UserLevelBadges"
import useUiStore from "../../stores/uiStore"
import { jobRow } from "../../Helpers/listRows"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { atoms } from "../../styles/atoms"

// task: the open task (the client is its poster)
const HomeTaskerItem = ({ task }) => {
  const navigation = useNavigation()
  const language = useUiStore((state) => state.language)
  const row = jobRow(task, language)
  const user = row.client
  const quickTask = row.sos
  const iconColor = quickTask ? palette.white : palette.orange

  const openProfile = () => navigation.navigate("TaskerProfile", { profile: user })

  return (
    <View style={[styles.row, quickTask ? styles.sos : styles.normal]}>
      <View style={styles.photoBox}>
        <View style={atoms.paddingHorizontal20}>
          <Pressable accessibilityRole="button" accessibilityLabel={translate("homeTaskerItem.clientProfile")} onPress={openProfile}>
            {row.avatar ? (
              <FastImageComponent source={{ uri: row.avatar }} style={styles.avatar} />
            ) : (
              <FastImageComponent style={[styles.emptyAvatar, { borderColor: quickTask ? palette.orange : palette.gray200 }]} source={require("../../assets/emptyavatar.png")} />
            )}
          </Pressable>
          <LevelRibbon user={user} set="CLIENT" count={user.tasks_count} style={atoms.left27} />
        </View>
        <MiniBadges user={user} set="CLIENT" count={user.tasks_count} style={atoms.marginTopMinus3} />
      </View>
      <View style={styles.details}>
        <Text style={styles.date}>{row.date}</Text>
        <Text style={styles.title}>{row.title}</Text>
        <View style={styles.stats}>
          <Text style={[styles.medium, styles.place]} ellipsizeMode="tail" numberOfLines={1}>
            {row.clientName}
          </Text>
          <View style={styles.counts}>
            <FontAwesome style={atoms.marginRight2} name="star" size={18} color={iconColor} />
            <Text style={[styles.medium, atoms.marginRight3]}>{row.stars ? row.stars : "-"}</Text>
            <Entypo style={atoms.marginRight2} name="check" size={18} color={iconColor} />
            <Text style={styles.medium}>{row.taskCount ? row.taskCount : 0}</Text>
          </View>
        </View>
      </View>
      {quickTask ? (
        <View style={styles.sosBadge}>
          <FastImageComponent style={styles.sosIcon} source={require("../../assets/quicktask.png")} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  photoBox: { position: "relative", marginRight: 5 },
  title: { fontSize: 18, fontFamily: "Montserrat_700Bold" },
  place: { width: 130, marginTop: 10 },
  details: { marginLeft: -10, marginTop: 10, width: "60%" },
  date: { fontSize: 14, fontFamily: "Montserrat_300Light", top: -10 },
  stats: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counts: { flexDirection: "row", marginTop: 10, justifyContent: "flex-end", marginLeft: 5 },
  sosBadge: { position: "absolute", right: 20, top: 10 },
  sosIcon: { width: 34, height: 27, right: -10 },
  row: { flexDirection: "row", paddingVertical: 10, marginBottom: 10 },
  normal: { borderBottomColor: palette.gray100, borderBottomWidth: 1, backgroundColor: palette.gray50 },
  sos: { backgroundColor: palette.orange },
  avatar: { width: 76, height: 76, position: "relative", borderRadius: 76 },
  emptyAvatar: { borderRadius: 76, borderWidth: 3, width: 76, height: 76 },
  medium: { fontSize: 16, fontFamily: "Montserrat_500Medium" }
})

export default HomeTaskerItem
