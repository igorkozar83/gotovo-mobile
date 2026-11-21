// FastImageComponent.js
// The app's image: cached on disk, a blurred placeholder while it loads, a short fade in.
import React from "react"
import { Image } from "expo-image"

const BLURHASH = "LGLEWtof57kB_NWBRjj[00jsEMWV"

// contentFit: "cover" unless given; transition: the fade in ms
const FastImageComponent = ({ source, style, transition, contentFit }) => (
  <Image
    autoplay={true}
    cachePolicy={"memory-disk"}
    priority={"high"}
    source={source}
    style={style}
    placeholder={BLURHASH}
    transition={transition ?? 100}
    contentFit={contentFit || "cover"}
  />
)

export default FastImageComponent
