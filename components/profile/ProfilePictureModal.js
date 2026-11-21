// ProfilePictureModal.js
// The user's avatar, large, with removing it and replacing it from the camera or the gallery (uploaded
// right away, then the user reloads).
import React from "react"
import { StyleSheet, View, Pressable, ImageBackground, Text, Dimensions } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import Button from "../ui/Button"
import FastImageComponent from "../media/FastImageComponent"
import PickerSheet from "../media/PickerSheet"
import ProfileBg from "../../assets/profilebg.png"
import useMediaPicker, { MEDIA } from "../../hooks/useMediaPicker"
import useRoleColors from "../../hooks/useRoleColors"
import useAuthStore from "../../stores/authStore"
import { translate } from "../../Helpers/language.utils"
import { useUploadAvatar } from "../../hooks/profile/useProfileUploads"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// the server's validation errors for the avatar file
const PERMISSION_TEXTS = {
  gallery: "In order to pick image from your gallery Gotovo app needs permission. Please give Gotovo app permission and try again.",
  camera: "In order to take picture with camera Gotovo app needs permission. Please give Gotovo app permission and try again."
}
// a full-quality phone photo is several MB, too big to upload
const PHOTO = { mediaTypes: MEDIA.images, quality: 0.5 }
const SMALL_SCREEN = Dimensions.get("screen").width < 380

const AvatarOption = ({ label, icon, color, onPress, style }) => (
  <View style={[styles.optionRow, style]}>
    <Pressable onPress={onPress} style={[styles.option, { backgroundColor: color }]}>
      <Text style={styles.optionText}>{translate(label)}</Text>
      <FastImageComponent source={icon} style={styles.optionIcon} />
    </Pressable>
  </View>
)

const ProfilePictureModal = ({ visible, onClose, reloadUser, deleteAvatar }) => {
  const avatar = useAuthStore((state) => state.user.userData.avatar)
  const colors = useRoleColors()
  const picker = useMediaPicker(PERMISSION_TEXTS)

  const upload = useUploadAvatar({ onSuccess: () => reloadUser() })

  // a refused permission keeps the modal open (its alert explains why)
  const uploadFrom = async (source) => {
    const picked = await source(PHOTO)
    if (!picked) return
    if (picked.asset) upload.run(picked.asset)
    onClose()
  }

  const noAvatarGap = !avatar ? { marginTop: 30 } : null
  return (
    <PickerSheet visible={visible} onClose={onClose} closeColor={palette.blue}>
      <View style={atoms.marginTop30}>
        <ImageBackground source={ProfileBg} resizeMode="cover" style={styles.ring}>
          <FastImageComponent source={avatar || require("../../assets/emptyavatar.png")} style={styles.avatarImage} />
        </ImageBackground>
      </View>
      {avatar ? (
        <View style={styles.options}>
          <Button background={palette.gray600} onPress={deleteAvatar} title={"profilePictureModal.remove"}>
            <AntDesign name="close" size={20} color={palette.white} />
          </Button>
        </View>
      ) : null}
      <AvatarOption
        label={"profilePictureModal.camera"}
        icon={require("../../assets/camera1.png")}
        color={colors.bgColor}
        style={noAvatarGap}
        onPress={() => uploadFrom(picker.fromCamera)}
      />
      <View style={styles.lastOption}>
        <AvatarOption
          label={"common.gallery"}
          icon={require("../../assets/galery1.png")}
          color={colors.bgColor}
          style={noAvatarGap}
          onPress={() => uploadFrom(picker.fromGallery)}
        />
      </View>
    </PickerSheet>
  )
}

const styles = StyleSheet.create({
  optionRow: { width: "100%", marginBottom: 10 },
  lastOption: { width: "100%", marginBottom: 5 },
  avatarImage: { width: 261, height: 261, borderRadius: 169 },
  options: { width: "100%", marginBottom: 10, marginTop: 30 },
  ring: { width: 289, height: 289, alignItems: "center", justifyContent: "center" },
  option: {
    borderRadius: 5,
    justifyContent: "center",
    paddingVertical: 10,
    paddingBottom: 8,
    elevation: 2,
    flexDirection: "row",
    marginHorizontal: 0,
    alignItems: "center",
    width: "100%",
    height: 40,
    display: "flex"
  },
  optionText: { lineHeight: SMALL_SCREEN ? 16 : 18, fontSize: SMALL_SCREEN ? 16 : 18, fontFamily: "Montserrat_500Medium", color: palette.white },
  optionIcon: { height: 20, width: 31, position: "absolute", right: 10 }
})

export default ProfilePictureModal
