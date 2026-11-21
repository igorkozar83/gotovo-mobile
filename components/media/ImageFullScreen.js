// ImageFullScreen.js
// A photo or video over the whole screen (a nearly opaque white backdrop) with a close button.
import React from "react"
import { View, Text, Pressable, Modal, Platform, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import MediaView from "./MediaView"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP } from "../../Helpers/accessibility"

// image: the photo or video address; show / close: the modal
const ImageFullScreen = ({ visible, image, onClose }) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.screen}>
      <View style={styles.backdrop}></View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("common.close")}
        hitSlop={HIT_SLOP}
        style={[styles.close, Platform.OS === "ios" && { top: "10%" }]}
        onPress={onClose}
      >
        <Text>
          <Ionicons name="close" size={30} color={palette.white} />
        </Text>
      </Pressable>
      <MediaView uri={image} active={visible} imageFit="cover" imageStyle={{ width: "100%", height: undefined }} videoStyle={styles.media} />
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  media: { alignSelf: "center", width: "100%", height: "100%" },
  screen: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
  backdrop: { backgroundColor: palette.white, opacity: 0.95, position: "absolute", top: 0, left: 0, bottom: 0, right: 0 },
  close: { position: "absolute", right: "3%", top: "5%", zIndex: 999, backgroundColor: palette.gray900, borderRadius: 35 }
})

export default ImageFullScreen
