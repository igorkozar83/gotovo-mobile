// MediaView.js
// A photo at its own aspect ratio, or a looping video with controls and a spinner until it can play.
import React from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { VideoView } from "expo-video"

import FastImageComponent from "./FastImageComponent"
import useMediaSource from "../../hooks/useMediaSource"
import { palette } from "../../styles/palette"

/**
 * uri: the photo or video; active: false while hidden (the video stops)
 * imageStyle: the photo's size (its aspectRatio is added); videoStyle: the video's box
 */
const MediaView = ({ uri, active = true, imageStyle, imageFit, videoStyle }) => {
  const media = useMediaSource(uri, active)
  if (!uri) return null

  if (!media.isVideo) return <FastImageComponent source={{ uri }} contentFit={imageFit} style={[{ aspectRatio: media.ratio }, imageStyle]} />
  if (!media.hasVideo) return null

  return (
    <>
      <View style={videoStyle}>
        <VideoView style={{ width: "100%", height: "100%", opacity: media.ready ? 1 : 0 }} player={media.player} nativeControls contentFit="contain" />
      </View>
      {!media.ready ? <ActivityIndicator color={palette.gray600} style={styles.loader} animating={true} size="large" /> : null}
    </>
  )
}

const styles = StyleSheet.create({
  loader: { position: "absolute", zIndex: 999, left: 0, right: 0, top: 0, bottom: 0 }
})

export default MediaView
