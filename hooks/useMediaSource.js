// useMediaSource.js
// A photo's or video's address prepared for showing: a photo's aspect ratio, or a looping video player
// and whether it is ready to play. Nothing plays while `active` is false (a closed modal).
import { useEffect, useState } from "react"
import { Image } from "react-native"
import { useVideoPlayer } from "expo-video"

import { isImage } from "../Helpers"
import { reportError } from "../Helpers/reportError"

const useMediaSource = (uri, active = true) => {
  const isVideo = !!uri && isImage(uri) === false
  const videoUri = active && isVideo ? uri : null

  const [ratio, setRatio] = useState(1)
  const [ready, setReady] = useState(false)

  const player = useVideoPlayer(videoUri || undefined, (created) => {
    if (created && videoUri) {
      created.loop = true
      created.play()
    }
  })

  // a photo's width / height
  useEffect(() => {
    if (!uri || isVideo) return
    Image.getSize(
      uri,
      (width, height) => {
        if (width && height) setRatio(width / height)
      },
      (error) => reportError(error, "useMediaSource")
    )
  }, [uri, isVideo])

  // a video shows once it can play
  useEffect(() => {
    setReady(false)
    if (!player || !videoUri) return
    if (player.status === "readyToPlay") setReady(true)
    const subscription = player.addListener("statusChange", (event) => {
      if ((event.status || event.newStatus) === "readyToPlay") setReady(true)
    })
    return () => subscription.remove()
  }, [player, videoUri])

  return { isVideo, ratio, player, ready: isVideo ? ready : true, hasVideo: !!videoUri }
}

export default useMediaSource
