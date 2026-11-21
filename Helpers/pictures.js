// pictures.js
// The small copies the API sends for lists and tiles (at most 480 px); the full picture opens on a tap.
// Where there is none (a video, an old picture, another site's avatar) the full URL stands for it.

// a task's, review's or dispute's picture as a tile
export const smallPicture = (picture) => (picture ? picture.thumbnail || picture.url : undefined)

// a user's avatar in a list, a chat or a small header
export const smallAvatar = (user) => (user ? user.avatar_thumbnail || user.avatar : undefined)
