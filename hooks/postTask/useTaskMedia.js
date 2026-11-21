// useTaskMedia.js
// The photos and video of a task being posted: those kept from the task it reposts and the new ones to
// upload (up to 6 photos and 1 video).
import { useState } from "react"

import { isImage } from "../../Helpers"
import useAlert from "../useAlert"

const MAX_IMAGES = 6
const MAX_VIDEOS = 1

const useTaskMedia = () => {
  const { showError } = useAlert()
  // each item: { uri, fromTask } (fromTask: kept from the reposted task, not uploaded again)
  const [media, setMedia] = useState([])

  const images = media.filter((item) => isImage(item.uri)).length
  const videos = media.length - images

  return {
    media,
    imagesFull: images >= MAX_IMAGES,
    videoFull: videos >= MAX_VIDEOS,
    // true when there is room for another photo or video (else the user is told)
    canAdd: () => {
      if (images < MAX_IMAGES || videos < MAX_VIDEOS) return true
      showError("useTaskMedia.imageVideoLimit", "useTaskMedia.youAlreadySetMaximumOfImages")
      return false
    },
    add: (asset) => asset && setMedia((current) => [...current, { ...asset, fromTask: false }]),
    remove: (index) => setMedia((current) => current.filter((_, i) => i !== index)),
    setFromTask: (uris) => setMedia(uris.map((uri) => ({ uri, fromTask: true }))),
    // the new ones kept with a guest's draft (Services/taskDraft), to upload as picked
    restore: (assets) => setMedia(assets.map((asset) => ({ ...asset, fromTask: false }))),
    clear: () => setMedia([]),
    // for the API: the new files to upload, and the kept ones as { uri }
    uploads: () => media.filter((item) => !item.fromTask),
    keptFromTask: () => media.filter((item) => item.fromTask).map(({ uri }) => ({ uri }))
  }
}

export default useTaskMedia
