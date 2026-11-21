// NewPictureAndVideoModal.js
// Attaching a photo or video (PostTask, dispute, review): a camera video, a camera photo or the gallery.
// Files over 30 MB and videos over 60 s are refused with an alert; an accepted one goes to setImage.
//   disableVideoUpload / onlyImages: photos only; disableImageUpload: videos only
import React from "react"
import { StyleSheet } from "react-native"
import { SimpleLineIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"

import PickerSheet, { PickerOption } from "../media/PickerSheet"
import FastImageComponent from "../media/FastImageComponent"
import useMediaPicker, { MEDIA } from "../../hooks/useMediaPicker"
import useAlert from "../../hooks/useAlert"
import { mediaProblems } from "../../Helpers/media"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const BLUE = palette.blue
const PERMISSION_TEXTS = {
  gallery: "In order to pick image from your gallery Gotovo app needs permission. Please give Gotovo app permission and try again.",
  camera: "In order to take picture with camera Gotovo app needs permission. Please give Gotovo app permission and try again."
}
const CAMERA = { allowsEditing: false, videoMaxDuration: 60, durationLimit: 60, quality: 0.1, videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low }

const NewPictureAndVideoModal = ({ onClose, visible, onPick, disableVideoUpload, disableImageUpload, onlyImages }) => {
  const { showError } = useAlert()
  const picker = useMediaPicker(PERMISSION_TEXTS)
  const photosOnly = disableVideoUpload || onlyImages
  const galleryTypes = photosOnly ? MEDIA.images : disableImageUpload ? MEDIA.videos : MEDIA.all

  // the modal closes once the picker has answered; a refused permission keeps it open
  const attachFrom = async (source, options) => {
    const picked = await source(options)
    if (!picked) return
    onClose()
    if (!picked.asset) return
    const problems = mediaProblems(picked.asset)
    if (problems) return showError("newPictureAndVideoModal.cameraError", problems)
    onPick(picked.asset)
  }

  return (
    <PickerSheet visible={visible} onClose={onClose} closeColor={BLUE}>
      {!photosOnly && (
        <PickerOption
          label={"newPictureAndVideoModal.cameraVideo"}
          color={BLUE}
          style={atoms.marginTop30}
          icon={<FastImageComponent source={require("../../assets/iconvideonew.png")} style={styles.optionIcon} />}
          onPress={() => attachFrom(picker.fromCamera, { ...CAMERA, mediaTypes: MEDIA.videos })}
        />
      )}
      {!disableImageUpload && (
        <PickerOption
          label={"newPictureAndVideoModal.cameraImage"}
          color={BLUE}
          style={photosOnly && { marginTop: 30 }}
          icon={<SimpleLineIcons name="camera" size={20} color={palette.white} />}
          onPress={() => attachFrom(picker.fromCamera, { ...CAMERA, mediaTypes: MEDIA.images })}
        />
      )}
      <PickerOption
        label={"common.gallery"}
        color={BLUE}
        icon={<SimpleLineIcons name="grid" size={20} color={palette.white} />}
        onPress={() => attachFrom(picker.fromGallery, { mediaTypes: galleryTypes, quality: 0.1 })}
      />
    </PickerSheet>
  )
}

const styles = StyleSheet.create({
  optionIcon: { height: 20, width: 20, resizeMode: "stretch" }
})

export default NewPictureAndVideoModal
