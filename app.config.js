export default {
  expo: {
    name: "Gotovo",
    slug: "gotovo",
    scheme: "com.gotovosrb.app",
    version: "0.1.20",
    orientation: "portrait",
    icon: "./assets/icongotovo.png",
    jsEngine: "hermes",
    newArchEnabled: true,
    plugins: [
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.618674152550-9prj2u96ddkge57f4v7kj94lql5r4ej3"
        }
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#002FAF",
          image: "./assets/splash-image.png",
          resizeMode: "cover"
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "targetSdkVersion": 36,
            "minSdkVersion": 24,
            "compileSdkVersion": 36
          }
        }
      ],
      "expo-font",
      "expo-video",
      "expo-secure-store",
      "expo-image-picker",
      "expo-localization",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin",
      "./plugins/fix-maps-pod",
      // Sentry's native setup and source map upload, once its organization is set (docs/sentry.md)
      ...(process.env.SENTRY_ORG ? [["@sentry/react-native/expo", { organization: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT, url: "https://sentry.io/" }]] : [])
      //"./android-manifest.plugin.js"
    ],
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    androidStatusBar: {
      barStyle: "dark-content",
      translucent: true,
      backgroundColor: "#002FAF"
    },
    ios: {
      appStoreUrl : "",
      buildNumber: "9",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON_IOS || "./GoogleService-Info.plist",
      bitcode: false,
      supportsTablet: false,
      bundleIdentifier: "com.gotovosrb.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This application uses location services in order to connect the two parties and provide information on which location the service should be provided.",
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["com.googleusercontent.apps.618674152550-9prj2u96ddkge57f4v7kj94lql5r4ej3"]
          }
        ]
      },
      config: {
        googleMapsApiKey: "AIzaSyCqdEixUfm67v_avbGK4Jmd-0RyMSQjBMQ",
        usesNonExemptEncryption: false,
        reservedClientId: "com.googleusercontent.apps.618674152550-9prj2u96ddkge57f4v7kj94lql5r4ej3"
      }
    },
    android: {
      versionCode: 22,
      softwareKeyboardLayoutMode: "pan",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/icongotovoandroid.png",
        backgroundColor: "#002FAF"
      },
      config: {
        // googleSignIn: {
        //   apiKey: "AIzaSyCqdEixUfm67v_avbGK4Jmd-0RyMSQjBMQ"
        // },
        googleMaps: {
          apiKey: "AIzaSyCqdEixUfm67v_avbGK4Jmd-0RyMSQjBMQ"
        }
      },
      package: "com.gotovosrb.app",
      // what the app asks for itself (the plugins add their own): the camera and microphone (photos, videos
      // with sound), the calendar (a task in the phone's calendar) and notifications after a restart
      permissions: ["CAMERA", "RECORD_AUDIO", "READ_CALENDAR", "WRITE_CALENDAR", "RECEIVE_BOOT_COMPLETED"],
      // never asked for, even if a library or the template adds it: location (the app does not use it) and
      // drawing over other apps
      blockedPermissions: ["android.permission.ACCESS_COARSE_LOCATION", "android.permission.ACCESS_FINE_LOCATION", "android.permission.SYSTEM_ALERT_WINDOW"]
    },
    web: {
      favicon: "./assets/icongotovo.png"
    },
    extra: {
      // the crash reporter: off without a DSN (docs/sentry.md)
      SENTRY_DSN: process.env.SENTRY_DSN || "",
      SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || "",
      SENTRY_IN_DEV: ["1", "true"].includes(String(process.env.SENTRY_IN_DEV).toLowerCase()),
      // the app's server: production, unless the build or Metro is started with API_URL / SOCKET_URL (the
      // local Docker backend through adb reverse: API_URL=http://localhost:8084/api/ SOCKET_URL=http://localhost:3006)
      API_URL: process.env.API_URL || "https://app.gotovo.rs/api/",
      SOCKET_URL: process.env.SOCKET_URL || "https://app.gotovo.rs",
      GOOGLE_CLIENT_ID: "618674152550-6q7gs3cgaduvrac72n0oqcmm17sbvoak.apps.googleusercontent.com",
      ANDROID_GOOGLE_CLIENT_ID: "618674152550-6q7gs3cgaduvrac72n0oqcmm17sbvoak.apps.googleusercontent.com",
      IOS_GOOGLE_CLIENT_ID: "618674152550-crcb2h826tba0anm4o5bc3hnhdaluepc.apps.googleusercontent.com",
      FACEBOOK_CLIENT_ID: "829119422020797",
      PUSH_ID: "@igorkozar/Gotovo",
      CREATE_PAYMENT_LINK: "https://app.gotovo.rs/add-payment-method", // gotovo https://app.gotovo.rs //hotovo https://hotovo.it-fortress.com
      eas: {
        //projectId: '875c7c5c-cb0e-4d6e-8f38-1ba3787f330b' //Hotovo
        projectId: "61361d3d-14eb-4763-b60e-7d5af76cfe76" //Gotovo
      }
    }
  },
  build: {
    preview: {
      android: {
        buildType: "apk",
        image: "latest",
        cache: {
          disabled: true
        }
      },
      ios: {
        image: "latest",
        cache: {
          disabled: true
        }
      }
    }
  },
  platforms: ["ios", "android"]
}
