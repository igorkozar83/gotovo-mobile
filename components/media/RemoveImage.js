// RemoveImage.js
// Asks before removing a picked photo or video: shows it, then REMOVE (onRemove) or CANCEL.
import React, { useState } from "react"
import { View, ScrollView, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

import GradientModal, { BLUE, ORANGE } from "../sheets/GradientModal"
import MediaView from "./MediaView"
import Button from "../ui/Button"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// image: the photo or video address; notImage: it is a video; onRemove: removes it
const RemoveImage = ({ onClose, visible, image, onRemove, notImage }) => {
  const userSelect = useAuthStore((state) => state.userSelect)
  // the photo fills the card's width
  const [cardWidth, setCardWidth] = useState(0)

  return (
    <GradientModal
      visible={visible}
      onClose={onClose}
      onRequestClose={onClose}
      colors={userSelect === "TASKER" ? ORANGE : BLUE}
      closeStyle={styles.close}
      keyboardAvoiding={false}
      cardStyle={atoms.overflowHidden}
    >
      <ScrollView
        onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconBlock}>
          <MediaView uri={image} active={visible} imageStyle={{ width: cardWidth ? cardWidth - 70 : 0, maxHeight: 400 }} videoStyle={styles.media} />
        </View>
        <View style={styles.titleBlock}>
          <Button
            onPress={onRemove}
            title={notImage ? translate("removeImage.removeVideo") : translate("removeImage.removePhoto")}
            background={palette.white}
            textColor={palette.blueDark}
          >
            <Feather name="x" size={22} color={palette.blueDark} />
          </Button>
        </View>
        <View style={styles.buttons}>
          <Button onPress={onClose} title={translate("common.cancel")} background={palette.gray350} textColor={palette.blueDark}>
            <Feather name="arrow-left" size={24} color={palette.blueDark} />
          </Button>
        </View>
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  close: { right: 5, top: 10, zIndex: 2 },
  content: { flexGrow: 1, borderRadius: 15, overflow: "hidden", padding: 25 },
  iconBlock: { justifyContent: "center", alignItems: "center", marginTop: 40 },
  media: { width: "100%", height: 300, backgroundColor: palette.black },
  titleBlock: { justifyContent: "center", alignItems: "center", marginTop: 20 },
  buttons: { justifyContent: "center", alignItems: "center", marginVertical: 15 }
})

export default RemoveImage
