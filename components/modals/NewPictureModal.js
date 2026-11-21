// NewPictureModal.js
// Adding a document (licence, certificate, ID) to the profile from the camera or the gallery. It is
// uploaded right away; the admin team reviews it for a badge.
import React from "react"
import { SimpleLineIcons } from "@expo/vector-icons"

import PickerSheet, { PickerOption } from "../media/PickerSheet"
import useMediaPicker, { MEDIA } from "../../hooks/useMediaPicker"
import useRoleColors from "../../hooks/useRoleColors"
import { useUploadDocument } from "../../hooks/profile/useProfileUploads"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const PERMISSION_TEXTS = {
  gallery: "In order to pick image/video from your gallery Gotovo app needs permission. Please give Gotovo app permission and try again.",
  camera: "In order to take picture/video with camera Gotovo app needs permission. Please give Gotovo app permission and try again."
}

const NewPictureModal = ({ onClose, visible, reloadUser }) => {
  const colors = useRoleColors()
  const picker = useMediaPicker(PERMISSION_TEXTS)

  const upload = useUploadDocument({ onSuccess: () => reloadUser() })

  // a refused permission keeps the modal open (its alert explains why)
  const uploadFrom = async (source, options) => {
    const picked = await source(options)
    if (!picked) return
    if (picked.asset) upload.run(picked.asset)
    onClose()
  }

  return (
    <PickerSheet visible={visible} onClose={onClose} closeColor={colors.bgColor}>
      <PickerOption
        label={"newPictureModal.camera"}
        color={colors.bgColor}
        style={atoms.marginTop30}
        icon={<SimpleLineIcons name="camera" size={20} color={palette.white} />}
        onPress={() => uploadFrom(picker.fromCamera, { mediaTypes: MEDIA.all, videoMaxDuration: 60, quality: 0.5 })}
      />
      <PickerOption
        label={"common.gallery"}
        color={colors.bgColor}
        icon={<SimpleLineIcons name="grid" size={20} color={palette.white} />}
        onPress={() => uploadFrom(picker.fromGallery, { mediaTypes: MEDIA.all, quality: 0.5 })}
      />
    </PickerSheet>
  )
}

export default NewPictureModal
