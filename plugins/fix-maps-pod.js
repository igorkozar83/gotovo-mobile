// fix-maps-pod.js
// Expo config plugin: the iOS Podfile names the maps pod react-native-google-maps; rename it to
// react-native-maps, which is what the project ships.
const { withFinalizedMod } = require("@expo/config-plugins")
const fs = require("fs")
const path = require("path")

module.exports = function withFixMapsPod(config) {
  return withFinalizedMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile")
      let content = fs.readFileSync(podfilePath, "utf8")
      content = content.replace(/pod 'react-native-google-maps'/g, "pod 'react-native-maps'")
      fs.writeFileSync(podfilePath, content)
      return config
    }
  ])
}
