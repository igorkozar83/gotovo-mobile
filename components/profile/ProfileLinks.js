// ProfileLinks.js
// The buttons at the end of the profile: change password, task history, reviews.
import React from "react"
import { View, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { FontAwesome5, Feather } from "@expo/vector-icons"

import Button from "../ui/Button"
import { palette } from "../../styles/palette"

const ProfileLinks = ({ onChangePassword }) => {
  const navigation = useNavigation()

  return (
    <>
      <View style={styles.link}>
        <Button onPress={onChangePassword} title={"profileLinks.changePassword"}>
          <FontAwesome5 name="star-of-life" size={20} color={palette.white} />
        </Button>
      </View>
      <View style={styles.linkRow}>
        <Button onPress={() => navigation.navigate("MyTasks", { type: "finished" })} title={"profileLinks.taskHistory"}>
          <FontAwesome5 name="check-double" size={20} color={palette.white} />
        </Button>
      </View>
      <View style={styles.lastLinkRow}>
        <Button onPress={() => navigation.navigate("MyReviews")} title={"profileLinks.reviews"}>
          <Feather name="star" size={20} color={palette.white} />
        </Button>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  linkRow: { width: "100%", marginBottom: 10 },
  lastLinkRow: { width: "100%", marginBottom: 70 },
  link: { width: "100%", marginBottom: 10, marginTop: 10 }
})

export default ProfileLinks
