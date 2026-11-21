// ScheduledInfoBlock.js
// The accepted time of an offer's task (not for a canceled offer).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import ScheduledTimeRow from "../taskDetails/ScheduledTimeRow"
import { translate } from "../../Helpers/language.utils"
import { atoms } from "../../styles/atoms"

// accepted: the accepted time (false without one); color: the title's
const ScheduledInfoBlock = ({ offer, accepted, language, color }) => {
  if (!accepted || offer.status === 4) return null

  return (
    <>
      <View style={styles.block}>
        <Text style={{ fontSize: 12, color, fontFamily: "Montserrat_700Bold" }}>{translate("scheduledInfoBlock.taskScheduledFor")}</Text>
      </View>
      <ScheduledTimeRow time={accepted} language={language} style={atoms.marginVertical20} />
    </>
  )
}

const styles = StyleSheet.create({
  block: { paddingTop: 20, paddingHorizontal: 20 }
})

export default ScheduledInfoBlock
