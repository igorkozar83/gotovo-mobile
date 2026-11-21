// queryString.js
// Query parameters written the way the API reads them: an object as key[field]=... (v2's filter[...], sort[...]),
// an array as key[]=..., null and undefined left out (also inside an object).

// encodeURIComponent, keeping : $ , [ ] readable and spaces as +
const encode = (value) =>
  encodeURIComponent(value).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]")

const asText = (value) => (value instanceof Date ? value.toISOString() : value)

// [key, value] pairs of one parameter
const pairs = (key, value) => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map((item) => [key + "[]", asText(item)])
  if (typeof value === "object" && !(value instanceof Date)) return Object.entries(value).flatMap(([field, inner]) => pairs(key + "[" + field + "]", inner))
  return [[key, asText(value)]]
}

export const serializeParams = (params) =>
  Object.entries(params || {})
    .flatMap(([key, value]) => pairs(key, value))
    .map(([key, value]) => encode(key) + "=" + encode(value))
    .join("&")
