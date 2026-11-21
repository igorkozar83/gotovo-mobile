// PhotoTiles.js
// Picked photos, three to a row, each opening full screen and with an X to remove it, plus an add tile
// while there is room. All tiles are one size, three filling rowWidth with a gap between; the look is the
// form's: height, the gap below, and the add tile's background and icon (style: the row's spacing).
import React from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import FastImageComponent from "./FastImageComponent"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const GAP = 5

const PhotoTiles = ({ photos, max, rowWidth, height = 70, gapBelow = 5, addBackground = palette.gray350, addIcon, style, onOpen, onRemove, onAdd }) => {
  const width = Math.max(0, (rowWidth - 2 * GAP) / 3)
  const tile = (index) => ({ width, height, marginBottom: gapBelow, marginLeft: index % 3 !== 0 ? GAP : 0 })
  return (
    <View style={[styles.tiles, style]}>
      {photos.map((photo, index) => (
        <View key={`photo-tile-${index}`}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("common.openPhoto")}
            onPress={() => onOpen(photo?.uri)}
            style={[styles.tile, tile(index), atoms.backgroundColorGray350]}
          >
            <FastImageComponent source={{ uri: photo?.uri }} style={styles.photo} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={translate("common.removePhoto")} hitSlop={HIT_SLOP} onPress={() => onRemove(index)} style={styles.removeButton}>
            <Ionicons name="close" size={22} color={palette.white} />
          </Pressable>
        </View>
      ))}
      {photos.length < max && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate("common.addPhoto")}
          style={[styles.tile, tile(photos.length), { backgroundColor: addBackground }]}
          onPress={onAdd}
        >
          {addIcon}
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  // (tops in line: a photo and the add tile start at the same height)
  tiles: { flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 },
  tile: { justifyContent: "center", alignItems: "center", borderRadius: 5, overflow: "hidden" },
  photo: { width: "100%", height: "100%", borderRadius: 5 },
  removeButton: { position: "absolute", top: "3%", right: "3%", zIndex: 20, backgroundColor: palette.inkShadow, borderRadius: 30 }
})

export default PhotoTiles
