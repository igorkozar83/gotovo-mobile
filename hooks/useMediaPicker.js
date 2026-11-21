// useMediaPicker.js
// Picking from the gallery or taking with the camera, after asking for the permission. A refused
// permission is explained in an alert and gives null; otherwise the result is { asset }, asset being
// null when the user cancelled.
import * as ImagePicker from "expo-image-picker"

import useAlert from "./useAlert"

export const MEDIA = { all: ImagePicker.MediaTypeOptions.All, images: ImagePicker.MediaTypeOptions.Images, videos: ImagePicker.MediaTypeOptions.Videos }

const picked = (result) => ({ asset: result.canceled ? null : result.assets[0] })

/** texts: { gallery, camera } - why the app needs each permission (translation keys) */
const useMediaPicker = (texts) => {
  const { showError } = useAlert()

  return {
    fromGallery: async (options) => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        showError("useMediaPicker.imagePickerError", texts.gallery)
        return null
      }
      return picked(await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, ...options }))
    },
    fromCamera: async (options) => {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync()
      if (!granted) {
        showError("useMediaPicker.cameraError", texts.camera)
        return null
      }
      return picked(await ImagePicker.launchCameraAsync(options))
    }
  }
}

export default useMediaPicker
