// apiError.js
// The v2 API's failure ({ error: { code, message, fields, reason } } with the HTTP status) as { status, code,
// message, fields, reason }; null for anything else (network, a v1 answer, a 5xx page). reason: e.g. "deleted"
// beside account_disabled
export const apiError = (error) => {
  const response = error && error.response
  const body = response && response.data && response.data.error
  return body && typeof body === "object" && typeof body.code === "string"
    ? { status: response.status, code: body.code, message: body.message, fields: body.fields || null, reason: body.reason || null }
    : null
}

// the title of a closed account's notice: deleted (its own words), or disabled by an admin
export const accountClosedTitle = (failure) => (failure && failure.reason === "deleted" ? "common.accountIsDeleted" : "common.accountDisabled")
