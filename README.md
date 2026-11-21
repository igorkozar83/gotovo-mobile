# Gotovo mobile app

The Android and iOS app of Gotovo, a marketplace where clients post tasks and taskers send offers, do the work and
get reviewed. It talks to the Gotovo backend (the API and the live-updates server).

## Stack

- **Language:** JavaScript (no TypeScript)
- **Framework:** React Native 0.83 with Expo SDK 55 (development builds, not Expo Go), React 19
- **Server data:** TanStack Query 5; app state in Zustand 5
- **Forms and validation:** react-hook-form 7, Zod 4
- **Translations:** i18n-js; texts by id in `i18n/messages.js`, the words in `assets/translations.json`, newer
  words from the server at start
- **Maps and addresses:** react-native-maps (Google Maps on Android), address suggestions through the backend
  (Google Places)
- **Sign-in:** e-mail and password, Google (`@react-native-google-signin/google-signin`), Apple
- **Push notifications:** expo-notifications (Firebase Cloud Messaging on Android)
- **Live updates:** laravel-echo with socket.io-client
- **Crash reporting:** Sentry (off until it is configured, see `docs/sentry.md`)
- **Tests and checks:** Jest (jest-expo) with React Native Testing Library, ESLint 9, Prettier 3

## Project layout

| Folder | What it holds |
|---|---|
| `screens/` | One file per screen |
| `components/` | Screen parts, modals, shared UI |
| `hooks/` | Data and screen logic (queries, forms, actions) |
| `Services/` | API calls, push, live updates, device services |
| `stores/` | Zustand stores (session, UI, modals, alerts) |
| `Helpers/` | Pure functions (dates, prices, task states, API errors) |
| `i18n/`, `assets/translations.json` | Texts |
| `styles/` | Palette, shared styles |
| `plugins/` | Expo config plugins |
| `.maestro/` | Maestro UI flows |

`android/` and `ios/` are not in the repository: they are generated from `app.config.js` (`npx expo prebuild`).

## Requirements

- Node.js 20 or newer, with npm
- Android Studio with the Android SDK (API 36) and JDK 17, for Android builds
- Xcode on macOS, for iOS builds
- A running Gotovo backend: the production one, or a local one (see the backend repository's README)

## Running in development

1. Install the dependencies:

       npm ci

2. Build and install the development app on a phone or emulator. Needed the first time and after any change to
   native modules or `app.config.js`:

       npx expo run:android

   (or `npx expo run:ios` on macOS; the same as `npm run android` / `npm run ios`)

3. Start the JavaScript bundler. By default the app uses the production API. To use a local backend, start it with
   its addresses:

       API_URL=http://localhost:8084/api/ SOCKET_URL=http://localhost:3006 npx expo start --dev-client --port 8083

   On an Android phone or emulator connected by USB, forward the ports so `localhost` reaches the computer:

       adb reverse tcp:8083 tcp:8083
       adb reverse tcp:8084 tcp:8084
       adb reverse tcp:3006 tcp:3006

   Restart the bundler after changing these variables.

## Environment variables

Read when the app is built or the bundler starts (`app.config.js`). None of them is required for a production
build. Values are not listed here; ask the project owner for them.

| Variable | Purpose |
|---|---|
| `API_URL` | The API's address, ending in `/api/`. Default: production |
| `SOCKET_URL` | The live-updates server's address. Default: production |
| `SENTRY_DSN` | Sentry project key; without it crash reporting is off |
| `SENTRY_ENVIRONMENT` | Environment name in Sentry |
| `SENTRY_IN_DEV` | `true` to report from development builds too |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Sentry organization and project, for the native setup and source map upload |
| `GOOGLE_SERVICES_JSON_IOS` | Path of the iOS Firebase file, when it is not `./GoogleService-Info.plist` |

## Configuration in the repository

These values are not secrets (every installed app holds them), but they belong to the project's Google, Firebase
and Expo accounts. Change them when the app moves to other accounts:

| Where | What |
|---|---|
| `app.config.js` → `android.config.googleMaps.apiKey`, `ios.config.googleMapsApiKey` | Google Maps SDK key, restricted to the app's package and signing certificates |
| `Services/socialSignIn.js` | Google OAuth client ids (web, Android, iOS) |
| `app.config.js` → `iosUrlScheme`, `CFBundleURLSchemes`, `reservedClientId` | The iOS OAuth client id, reversed |
| `google-services.json` | Firebase project for Android (push notifications) |
| `GoogleService-Info.plist` | Firebase project for iOS |
| `app.config.js` → `extra.eas.projectId` | The Expo (EAS) project |

The Firebase Cloud Messaging server key for push notifications is not in the repository: it is uploaded to the
Expo project (expo.dev → Credentials → Android → FCM V1 service account key).

## Tests and checks

    npm test               # Jest
    npm run lint           # ESLint
    npm run format:check   # Prettier

## Release builds

- **APK for testing:** generate the native project and build it:

      npx expo prebuild --platform android
      cd android
      ./gradlew assembleRelease

  The APK is in `android/app/build/outputs/apk/release/`. It is signed with the template's debug key: fine for
  testers, not for the store.
- **Store builds:** with EAS, using the project's signing credentials:

      npx eas build --platform android --profile production
      npx eas build --platform ios --profile production

Before each release, raise `version` and `android.versionCode` (and `ios.buildNumber`) in `app.config.js`.
