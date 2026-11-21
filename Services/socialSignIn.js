// socialSignIn.js
// Signing in with Google or Apple on the device. What they return goes to the server login
// (useLoginActions).
import * as AppleAuthentication from "expo-apple-authentication"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { reportError } from "../Helpers/reportError"

const GOOGLE_IOS_CLIENT_ID = "618674152550-9prj2u96ddkge57f4v7kj94lql5r4ej3.apps.googleusercontent.com"
const GOOGLE_ANDROID_CLIENT_ID = "618674152550-jl7olqfmj6l06neknte5c8spirg1821a.apps.googleusercontent.com"

// for logging in and for registering alike (the server's Google login makes the account when it is new).
// (Registering used the Android id as the web client id: on a real phone Google refused it with
// DEVELOPER_ERROR and nothing happened.)
export const GOOGLE_LOGIN = {
  offlineAccess: true,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  webClientId: "618674152550-ntm992qmmqulon4hvbev8brjt8c3jg0r.apps.googleusercontent.com",
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  scopes: ["profile", "email"]
}

// the Google access token, or null when the user cancels or Google sign-in isn't available
export const googleAccessToken = async (config) => {
  try {
    GoogleSignin.configure(config)
    await GoogleSignin.hasPlayServices()
    if (GoogleSignin.getCurrentUser()) await GoogleSignin.revokeAccess()
    await GoogleSignin.signIn()
    return (await GoogleSignin.getTokens()).accessToken
  } catch (error) {
    reportError(error, "socialSignIn")
    return null
  }
}

// the Apple credential (throws when the user cancels or it fails)
export const appleCredential = () =>
  AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL]
  })

export const appleAvailable = () => AppleAuthentication.isAvailableAsync()
