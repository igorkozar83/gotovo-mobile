// useProfileUploads.js
// Uploading the user's avatar and their documents (licences, ID) for the badges.
import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import { uploadImage, uploadUserImage } from "../../Services/UsersAPI"
import { serverMessages } from "../../Helpers/apiErrors"

// the server's avatar validation messages, as the user reads them
const AVATAR_ERRORS = {
  "validation.image": "Image is required.",
  "validation.mimes": "Make sure that you upload image.",
  "validation.required": "Please make sure that you selected image."
}

// run(asset)
export const useUploadAvatar = ({ onSuccess } = {}) =>
  useApiAction(uploadImage, {
    error: "useProfileUploads.avatarUploadError",
    invalid: (error) => serverMessages(error, AVATAR_ERRORS),
    failed: "useProfileUploads.thereWasAnErrorWhileUploadingAvatar",
    onSuccess
  })

// run(asset): the admins check it before a badge is given, and the user is told so
export const useUploadDocument = ({ onSuccess } = {}) => {
  const { showSuccess } = useAlert()
  return useApiAction(uploadUserImage, {
    error: "useProfileUploads.imageUploadError",
    invalid: serverMessages,
    failed: "useProfileUploads.thereWasAnErrorWhileUploadingImage",
    onSuccess: (...args) => {
      if (onSuccess) onSuccess(...args)
      showSuccess("useProfileUploads.documentUpload", "useProfileUploads.yourDocumentWillBeInspectedBy")
    }
  })
}
