// UsersAPI.js
// The signed-in user's profile, documents, addresses and settings, and the address at a point (API v2: each call
// resolves to the answer's data, or nothing; a refusal rejects with the API's error, see Helpers/apiError).
import { api, upload } from "./client"

const imagePart = (image) => ({ uri: image.uri, name: image.uri.split("/").pop(), type: "image/" + image.uri.split(".").pop() })

// { avatar }: its address
export const uploadImage = async (image) => {
  const data = new FormData()
  data.append("avatar", imagePart(image))
  return (await upload("me/avatar", data)).data.data
}

export const deleteAvatar = async () => {
  await api.delete("me/avatar")
}

// any of full_name, last_name, about, age, gender (null: none) and languages (the names of those spoken); the profile
// as it is now
export const updateProfile = async (fields) => (await api.patch("me", fields)).data.data

// the document (with its signed link)
export const uploadUserImage = async (image) => {
  const data = new FormData()
  data.append("image", imagePart(image))
  return (await upload("me/documents", data)).data.data
}

export const deleteUserImage = async (id) => {
  await api.delete("me/documents/" + id)
}

// { street, city, zip } at { latitude, longitude }
export const getAddress = async ({ latitude, longitude }) => (await api.get("geocode", { params: { latitude, longitude } })).data.data

export const addUserAddress = async (data) => (await api.post("me/addresses", data)).data.data

export const editUserAddress = async ({ id, ...data }) => (await api.patch("me/addresses/" + id, data)).data.data

export const removeUserAddress = async (id) => {
  await api.delete("me/addresses/" + id)
}

// 0 client, 1 tasker
export const updateUserType = async (type) => {
  await api.put("me/type", { type })
}

export const updateExpoPushToken = async (expoPushToken) => {
  await api.put("me/push-token", { expo_push_token: expoPushToken })
}

export const removePhone = async () => {
  await api.delete("me/phone")
}

export const requestEmailVerification = async () => {
  await api.post("me/email-verification")
}

export const updateLanguage = async (lang) => {
  await api.put("me/language", { lang })
}
