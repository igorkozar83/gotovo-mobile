// media.js
// Checks on a picked photo or video before it is attached.
import { failedRules } from "./validation"

const MAX_MB = 30
const MAX_VIDEO_SECONDS = 60

// what is wrong with a picked asset (one message per line), "" when it is fine; duration is in ms
export const mediaProblems = (asset) =>
  failedRules([
    [(asset.fileSize || 0) / (1024 * 1024) > MAX_MB, "media.maximumFileSizeIs30mb"],
    [!!asset.duration && asset.duration / 1000 > MAX_VIDEO_SECONDS, "media.maximumLengthOfVideoIs60"]
  ])
