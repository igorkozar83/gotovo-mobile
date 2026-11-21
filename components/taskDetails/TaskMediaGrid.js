// TaskMediaGrid.js
// A task's photos and videos, three to a row; a tile opens the photo or video full screen.
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const TILE = (Dimensions.get("screen").width - 44) / 3

const TaskMediaGrid = ({ tiles, onOpen }) => (
  <View style={atoms.marginBottom40}>
    <Text style={styles.label}>{translate("taskMediaGrid.photosVideos")}</Text>
    <View style={styles.photos}>
      {tiles.map((tile, index) => {
        const first = index % 3 === 0
        const width = first ? TILE : TILE - 5
        return (
          <Pressable accessibilityRole="button" accessibilityLabel={translate("common.openPhoto")} key={`task-media-${index}`} onPress={() => onOpen(tile.original)}>
            <View style={[styles.photosHolder, { marginLeft: first ? 0 : 5, width }]}>
              <FastImageComponent contentFit="cover" source={{ uri: tile.url }} style={{ width, height: "100%", borderRadius: 5 }} />
              {tile.type === "video" ? <FastImageComponent contentFit="cover" source={require("../../assets/iconVideoPlay.png")} style={styles.play} /> : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  </View>
)

const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular", color: palette.charcoal, marginBottom: 10 },
  photos: { flexDirection: "row", alignContent: "space-between", alignItems: "stretch", flexWrap: "wrap", width: "100%" },
  photosHolder: { justifyContent: "center", alignItems: "center", height: 85, backgroundColor: palette.gray350, borderRadius: 5, marginBottom: 5 },
  play: { width: 28, height: 28, position: "absolute" }
})

export default TaskMediaGrid
