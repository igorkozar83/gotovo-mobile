// ErrorBoundary.js
// Catches an error thrown while its children render, so it shows a message with a way back instead of a
// blank screen. withScreenBoundary puts one around each screen: a broken screen offers Home, and the
// rest of the app (Main: alerts, modals, the bottom bar) keeps working.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import { translate } from "../Helpers/language.utils"
import { reportError } from "../Helpers/reportError"
import { palette } from "../styles/palette"

// the message and one button (retry, or back to Home)
export const ErrorFallback = ({ onRetry, retryText = "errorBoundary.tryAgain" }) => (
  <View style={styles.screen}>
    <Text accessibilityRole="header" style={styles.title}>
      {translate("errorBoundary.somethingWentWrong")}
    </Text>
    <Text style={styles.text}>{translate("errorBoundary.pleaseTryAgainIfItHappens")}</Text>
    <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
      <Text style={styles.buttonText}>{translate(retryText)}</Text>
    </Pressable>
  </View>
)

/**
 * onReset(): runs when the user retries, before the children render again (e.g. go to another screen)
 * retryText: the button's text
 */
export default class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    reportError(error, "render" + (info && info.componentStack ? info.componentStack.split("\n")[1] : ""))
  }

  retry = () => {
    if (this.props.onReset) this.props.onReset()
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) return <ErrorFallback onRetry={this.retry} retryText={this.props.retryText} />
    return this.props.children
  }
}

// a screen inside its own boundary; retrying goes Home
export const withScreenBoundary = (Screen) => {
  const Bounded = (props) => (
    <ErrorBoundary retryText="BACK TO HOME" onReset={() => props.navigation.navigate("Home")}>
      <Screen {...props} />
    </ErrorBoundary>
  )
  Bounded.displayName = `Bounded(${Screen.displayName || Screen.name || "Screen"})`
  return Bounded
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30, backgroundColor: palette.white },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 22, color: palette.blueDark, textAlign: "center", marginBottom: 10 },
  text: { fontFamily: "Montserrat_400Regular", fontSize: 16, color: palette.gray800, textAlign: "center", marginBottom: 30 },
  button: { backgroundColor: palette.blueDark, borderRadius: 5, paddingVertical: 12, paddingHorizontal: 30 },
  buttonText: { fontFamily: "Montserrat_500Medium", fontSize: 16, color: palette.white }
})
