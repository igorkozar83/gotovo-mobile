// usePhotoList.js
// Photos picked for a form, up to `max`. canAdd() tells the user when the list is full (fullTitle,
// fullText) and returns false.
import { useState } from "react"

import useAlert from "./useAlert"

const usePhotoList = (max, full = null) => {
  const { showError } = useAlert()
  const [photos, setPhotos] = useState([])

  return {
    photos,
    add: (photo) => setPhotos((current) => [...current, photo]),
    remove: (index) => setPhotos((current) => current.filter((_, i) => i !== index)),
    clear: () => setPhotos([]),
    canAdd: () => {
      if (photos.length < max) return true
      if (full) showError(full.title, full.text)
      return false
    }
  }
}

export default usePhotoList
