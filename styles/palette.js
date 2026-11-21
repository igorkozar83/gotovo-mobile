// palette.js
// Every color the app uses. Components take colors from here (or, for the role's colors, from
// useRoleColors), never as literals.
export const palette = {
  // client blue
  blueDark: "#002FAF",
  blue: "#006EFF",
  blueSoft: "#8EAEFF",
  bluePale: "#E8EEFF",
  blueTableLight: "#DDE7FF",
  blueTableDark: "#A2BCFF",
  blueMuted: "#6489CE",
  bluePayment: "#2119AB",
  cyan: "#00ADF5",
  blueBright: "#0000FF",
  teal: "#03DAC6",

  // tasker orange
  orange: "#FE7F2D",
  orangeLight: "#FE904A",
  orangeSoft: "#FEAD79",
  orangePale: "#FFD8BF",
  orangeBurnt: "#DE591F",
  orangeDark: "#CA4017",
  orangeDeep: "#B82812",
  orangeWarm: "#F37128",
  orangeRust: "#CD4418",
  amber: "#FFA500",

  // warnings and disputes
  red: "#D10913",
  redSoft: "#DC3E41",
  redMuted: "#C5585D",
  redBright: "#FF0000",
  green: "#008000",

  // neutrals, dark to light
  black: "#000000",
  ink: "#0F0F0F",
  charcoal: "#231F20",
  slate: "#1B3142",
  gray900: "#2B2B2B",
  gray800: "#333333",
  gray700: "#707070",
  gray650: "#7D7D7D",
  gray600: "#808080",
  gray550: "#888888",
  gray500: "#A0A0A0",
  gray400: "#B8B8B8",
  gray350: "#C3C2C6",
  gray325: "#C8C8C8",
  gray300: "#D2D2D2",
  gray250: "#D9E1E8",
  gray225: "#DBDBDB",
  gray200: "#E0E0E0",
  gray100: "#E5E5E5",
  gray50: "#F0F0F0",
  gray25: "#F3F3F3",
  white: "#FFFFFF",

  // see-through
  inkShadow: "#0F0F0F40",
  // the notification light (Android push channel)
  notificationLight: "#FF231F7C",
  shade: "rgba(0, 0, 0, 0.5)",
  grayShadow: "rgba(128, 128, 128, 0.25)",
  slateShadow: "rgba(27, 49, 66, 0.3)",
  slateShadowLight: "rgba(27, 49, 66, 0.25)",
  // the white veil behind a modal
  overlay: "rgba(255, 255, 255, 0.7)",
  whiteVeil: "rgba(255, 255, 255, 0.8)",
  whiteFaint: "rgba(255, 255, 255, 0.1)",
  // fully clear; a gradient fades toward the clear color given, so each keeps its hue
  transparent: "rgba(0, 0, 0, 0)",
  whiteClear: "rgba(255, 255, 255, 0)",
  blueDarkClear: "rgba(0, 47, 175, 0)",
  orangeDarkClear: "rgba(202, 64, 23, 0)",
  slateClear: "rgba(36, 46, 57, 0)"
}
