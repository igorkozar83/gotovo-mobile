// MediaSection.js
// The task's photos and video: a grid with a tile to add more (the prompts are PhotoPrompts).
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"
import { Feather, Ionicons } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import PhotoPrompts, { usePhotoPrompts } from "../media/PhotoPrompts"
import { isImage } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import styles from "../../styles/PostTask.style"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

// three tiles to a row, the ones after the first with a gap
const tileBox = (index) => {
  const width = (Dimensions.get("screen").width - 44) / 3
  return index % 3 !== 0 ? { marginLeft: 5, width: width - 5 } : { marginLeft: 0, width }
}

// a picked photo or video: tapping it shows it full screen, the x asks to remove it
const MediaTile = ({ item, index, onOpen, onRemove }) => (
  <View>
    <Pressable accessibilityRole="button" accessibilityLabel={translate("common.openPhoto")} onPress={() => onOpen(item.uri)}>
      <View style={{ ...styles.photosHolder, ...tileBox(index) }}>
        <FastImageComponent source={{ uri: item.uri }} style={[styles.image, atoms.borderRadius5]} />
        {!isImage(item.uri) && <FastImageComponent source={require("../../assets/iconVideoPlay.png")} style={local.playIcon} />}
      </View>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={translate("common.removePhoto")} hitSlop={HIT_SLOP} onPress={() => onRemove(index)} style={local.removeButton}>
      <Ionicons name="close" size={22} color={palette.white} />
    </Pressable>
  </View>
)

const MediaSection = ({ media }) => {
  const prompts = usePhotoPrompts()

  return (
    <>
      <View>
        <Text style={styles.label}>{translate("mediaSection.photosVideos")}</Text>
      </View>
      <View style={{ ...styles.photos }}>
        {media.media.map((item, index) => (
          <MediaTile key={`image-tasks-list-${index}`} item={item} index={index} onOpen={prompts.preview} onRemove={prompts.remove} />
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel={translate("common.addPhoto")} onPress={() => media.canAdd() && prompts.pick()}>
          <View style={{ ...styles.photosHolder, ...tileBox(media.media.length) }}>
            <Feather name="plus-circle" size={32} color={palette.white} />
          </View>
        </Pressable>
      </View>
      <PhotoPrompts
        prompts={prompts}
        photos={media.media}
        onPick={media.add}
        onRemove={media.remove}
        pickerProps={{ disableVideoUpload: media.videoFull, disableImageUpload: media.imagesFull }}
      />
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  playIcon: { width: 28, height: 28, position: "absolute" },
  removeButton: { position: "absolute", top: "3%", right: "3%", zIndex: 20, backgroundColor: palette.inkShadow, borderRadius: 30 }
})

export default MediaSection
