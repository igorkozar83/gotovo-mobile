// useTaskMediaThumbs.js
// A task's photos and videos as tiles: { url (what the tile shows), type, original (what opens) }.
// A video's tile is a frame from it, added once it has been made.
import { useEffect, useState } from "react"
import * as VideoThumbnails from "expo-video-thumbnails"

import { isImage } from "../../Helpers"
import { reportError } from "../../Helpers/reportError"
import { smallPicture } from "../../Helpers/pictures"

const useTaskMediaThumbs = (media) => {
  const [tiles, setTiles] = useState([])

  useEffect(() => {
    let active = true
    const items = media || []
    // (a photo's tile is its thumbnail)
    setTiles(items.filter((item) => isImage(item.url)).map((item) => ({ url: smallPicture(item), type: "image", original: item.url })))

    items
      .filter((item) => isImage(item.url) === false)
      .forEach(async (item) => {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(item.url, { time: 1 })
          if (active) setTiles((current) => [...current, { url: uri, type: "video", original: item.url }])
        } catch (e) {
          reportError(e, "useTaskMediaThumbs")
        }
      })

    return () => {
      active = false
    }
  }, [media])

  return tiles
}

export default useTaskMediaThumbs
