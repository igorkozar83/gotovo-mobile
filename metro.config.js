// metro.config.js
// Expo's bundler settings; with Sentry's organization set (docs/sentry.md), Sentry's, which mark each
// bundle so its uploaded source maps match the crashes.
const { getDefaultConfig } = require("expo/metro-config")

module.exports = process.env.SENTRY_ORG ? require("@sentry/react-native/metro").getSentryExpoConfig(__dirname) : getDefaultConfig(__dirname)
