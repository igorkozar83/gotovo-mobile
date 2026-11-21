// DocumentsSection.js
// A tasker's licences, certificates and IDs: three to a row, each can be previewed or removed; the last
// tile adds a new one. onLayoutY reports where the section is (screens scroll to it).
import React from "react"
import { View, Pressable, Dimensions, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import SectionTitle from "./SectionTitle"
import FastImageComponent from "../media/FastImageComponent"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP } from "../../Helpers/accessibility"

// three tiles to a row, the ones after the first with a gap
const tileBox = (index) => {
  const width = (Dimensions.get("screen").width - 44) / 3
  return index % 3 !== 0 ? { marginLeft: 5, width: width - 5 } : { marginLeft: 0, width }
}

const DocumentsSection = ({ onLayoutY, onAdd, onPreview, onRemove }) => {
  const images = useAuthStore((state) => state.user.userData?.user_images)

  return (
    <>
      <View style={styles.documentsBlock} onLayout={(event) => onLayoutY(event.nativeEvent.layout.y)}>
        <SectionTitle title={"LICENCE, CERTIFICATES, ID"} tip={"Tooltip 4 licence, certificates, id"} />
      </View>
      <View style={styles.documents}>
        {(images || []).map((image, index) => (
          <View key={`user-images-list-${image.id ?? index}`} style={[styles.tile, tileBox(index)]}>
            <Pressable accessibilityRole="button" accessibilityLabel={translate("common.openPhoto")} onPress={() => onPreview(image)} style={styles.fill}>
              <FastImageComponent contentFit="cover" source={{ uri: image.image }} style={styles.fill} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={translate("common.removePhoto")} hitSlop={HIT_SLOP} onPress={() => onRemove(image)} style={styles.remove}>
              <Ionicons name="close" size={22} color={palette.white} />
            </Pressable>
          </View>
        ))}
        {images && (
          <Pressable accessibilityRole="button" accessibilityLabel={translate("common.addPhoto")} style={[styles.tile, styles.add, tileBox(images.length)]} onPress={onAdd}>
            <Ionicons name="add-circle-outline" size={34} color={palette.gray350} />
          </Pressable>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  documentsBlock: { position: "relative", marginBottom: 10 },
  documents: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap" },
  tile: { alignItems: "center", justifyContent: "center", backgroundColor: palette.gray100, height: 85, marginBottom: 10 },
  add: { borderRadius: 5 },
  fill: { width: "100%", height: "100%", borderRadius: 5 },
  remove: { position: "absolute", top: "3%", right: "3%", zIndex: 20, backgroundColor: palette.inkShadow, borderRadius: 30 }
})

export default DocumentsSection
