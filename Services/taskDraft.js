// taskDraft.js
// A task a guest filled in before registering, kept on the phone until they can post it: registering
// needs the e-mail confirmed before the first sign-in, so the task can't be posted at once. Kept: what
// was written and picked, with the photos and video (not the account's fields, never the password; a guest
// has no address yet: addresses belong to the account).
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as FileSystem from "expo-file-system/legacy"

import { reportError } from "../Helpers/reportError"

const KEY = "taskDraft"
// the older flow's key (it kept the payload and was never read again)
const OLD_KEY = "postTask"

const KEPT = ["subTask", "options", "taskName", "taskDesc", "additionalInstruction", "dates", "flexibleDates", "isSos", "phone"]

// the draft's photos and video: copied out of the picker's files, which sit in the cache the system may empty
// while the guest confirms their e-mail
const MEDIA_DIR = `${FileSystem.documentDirectory}taskDraft/`

const keepMedia = async (media) => {
  await FileSystem.deleteAsync(MEDIA_DIR, { idempotent: true })
  if (!media.length) return []
  await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true })
  return Promise.all(
    media.map(async (item, index) => {
      // (the file's own name last: its extension tells the upload its type)
      const uri = `${MEDIA_DIR}${index}-${item.uri.split("/").pop()}`
      await FileSystem.copyAsync({ from: item.uri, to: uri })
      return { ...item, uri }
    })
  )
}

// the kept files still there
const presentMedia = async (media) => {
  const found = await Promise.all(media.map(async (item) => (await FileSystem.getInfoAsync(item.uri)).exists))
  return media.filter((_, index) => found[index])
}

// values: the post-a-task form's; category: the chosen category's id; media: the picked photos and video
// (as useTaskMedia gives them to upload). Photos that could not be kept leave the rest of the draft as it is.
export const saveTaskDraft = async (values, category, media = []) => {
  let kept = []
  try {
    kept = await keepMedia(media)
  } catch (e) {
    reportError(e, "taskDraft.media")
  }
  const draft = { category, values: Object.fromEntries(KEPT.map((field) => [field, values[field]])), media: kept }
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(draft))
  } catch (e) {
    reportError(e, "taskDraft.save")
  }
}

// { category, values, media }, or null
export const loadTaskDraft = async () => {
  try {
    const stored = await AsyncStorage.getItem(KEY)
    if (!stored) return null
    const draft = JSON.parse(stored)
    return { ...draft, media: await presentMedia(draft.media || []) }
  } catch (e) {
    reportError(e, "taskDraft.load")
    return null
  }
}

export const clearTaskDraft = async () => {
  try {
    await AsyncStorage.multiRemove([KEY, OLD_KEY])
    await FileSystem.deleteAsync(MEDIA_DIR, { idempotent: true })
  } catch (e) {
    reportError(e, "taskDraft.clear")
  }
}
