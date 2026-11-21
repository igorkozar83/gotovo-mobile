// client.js
// The two axios clients: publicApi (no login) and api (sends the token), plus multipart uploads.
import { create } from "axios"
import Constants from "expo-constants"

import { getToken } from "./authToken"
import { serializeParams } from "./queryString"

const config = {
  // the API v2 (docs/api-v2.md): API_URL is the API's root (".../api/")
  baseURL: Constants.expoConfig.extra.API_URL + "v2/",
  // a request with no answer fails after 20 s instead of hanging (the session restore waits on one)
  timeout: 20000,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
  paramsSerializer: { serialize: serializeParams }
}

// endpoints that don't need a user (login, register, settings, ...)
export const publicApi = create(config)

// endpoints of the logged-in user: the token is attached here instead of in every call
export const api = create(config)

api.interceptors.request.use(async (request) => {
  const token = await getToken()
  if (token) request.headers.Authorization = "Bearer " + token
  return request
})

// one place to react to failed responses (e.g. a disabled account), shared by both clients
let responseErrorHandler = null

export const setResponseErrorHandler = (handler) => {
  responseErrorHandler = handler
}

const onResponseError = (error) => (responseErrorHandler ? responseErrorHandler(error) : Promise.reject(error))

api.interceptors.response.use((response) => response, onResponseError)
publicApi.interceptors.response.use((response) => response, onResponseError)

// multipart upload; like the old upload calls it goes without the X-Requested-With header
export const upload = (url, formData, onUploadProgress) =>
  api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // (no time limit: photos and a video can take long on a slow connection; progress shows it moving)
    timeout: 0,
    // the FormData goes as it is (the platform writes the multipart body and its boundary)
    transformRequest: [
      (data, headers) => {
        headers.delete("X-Requested-With")
        return data
      }
    ],
    onUploadProgress
  })
