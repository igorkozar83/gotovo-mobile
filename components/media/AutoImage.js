// AutoImage.js
// A bundled picture at the full width, at its own proportions.
import { Image } from "react-native"

const AutoImage = ({ source, style, ...props }) => {
  const { width, height } = Image.resolveAssetSource(source)
  const aspectRatio = width / height

  return <Image source={source} style={[{ width: "100%", aspectRatio }, style]} {...props} />
}

export default AutoImage
