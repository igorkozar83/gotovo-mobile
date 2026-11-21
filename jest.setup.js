// jest.setup.js
// Native modules the tested code imports, replaced by their in-memory mocks.
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"))

// the app config the API clients read (a test value; no request leaves the tests)
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { extra: { API_URL: "http://test.local/api/", SOCKET_URL: "http://test.local" } } } }))

// TanStack Query reports query/mutation changes on a setTimeout; in tests they run as microtasks, so
// they land inside the awaited act() that caused them
const { notifyManager } = require("@tanstack/react-query")
notifyManager.setScheduler(queueMicrotask)

// Native views and SDKs the rendered components import (component and screen tests); a test that needs
// their behaviour mocks them again itself.
// safe areas without a device: the library's own mock (no insets; SafeAreaView as a View)
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default)
// the crash reporter's SDK (native): its calls recorded, nothing sent
jest.mock("@sentry/react-native", () => ({ init: jest.fn(), setUser: jest.fn(), captureException: jest.fn() }))
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    getCurrentUser: jest.fn(),
    revokeAccess: jest.fn(),
    signIn: jest.fn(),
    getTokens: jest.fn(),
    signOut: jest.fn()
  },
  statusCodes: {}
}))
jest.mock("expo-video", () => ({
  VideoView: () => null,
  useVideoPlayer: () => ({ status: "idle", play: jest.fn(), pause: jest.fn(), replace: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) })
}))
// the six code fields as one field: typing the code fills it (onCodeFilled)
jest.mock("@twotalltotems/react-native-otp-input", () => {
  const React = require("react")
  const { TextInput } = require("react-native")
  const OTPInputView = React.forwardRef(({ onCodeFilled }, ref) => {
    React.useImperativeHandle(ref, () => ({ focusField: jest.fn() }))
    return <TextInput accessibilityLabel="Verification code" onChangeText={onCodeFilled} />
  })
  OTPInputView.displayName = "OTPInputView"
  return OTPInputView
})
// jest-expo's image loader still answers getSize by callback; React Native now awaits a promise from it
jest.spyOn(require("react-native").Image, "getSize").mockImplementation((uri, success) => success && success(320, 240))
// the map draws its children; a pin is a button named by its title
jest.mock("react-native-maps", () => {
  const React = require("react")
  const { View, Pressable } = require("react-native")
  const MapView = ({ children }) => <View>{children}</View>
  const Marker = ({ title, onPress }) => <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} />
  return { __esModule: true, default: MapView, Marker, PROVIDER_GOOGLE: "google" }
})
// gesture handler's own stand-ins for its native module (GestureHandlerRootView, its ScrollView)
require("react-native-gesture-handler/jestSetup")

// the texts that come with the app: tests read the keys themselves (as before there were any)
jest.mock("./assets/translations.json", () => ({ EN: {}, SR: {} }))
