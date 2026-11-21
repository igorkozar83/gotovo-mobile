import { smallAvatar, smallPicture } from "../pictures"

describe("the small copies for lists and tiles", () => {
  it("a picture's tile is its thumbnail, or the picture itself without one", () => {
    expect(smallPicture({ url: "full.jpg", thumbnail: "thumbs/full.jpg" })).toBe("thumbs/full.jpg")
    expect(smallPicture({ url: "clip.mp4" })).toBe("clip.mp4")
    expect(smallPicture(null)).toBeUndefined()
  })

  it("a list's avatar is the small one, or the avatar itself without one", () => {
    expect(smallAvatar({ avatar: "a.jpg", avatar_thumbnail: "thumbs/a.jpg" })).toBe("thumbs/a.jpg")
    expect(smallAvatar({ avatar: "https://lh3.googleusercontent.com/a" })).toBe("https://lh3.googleusercontent.com/a")
    expect(smallAvatar(undefined)).toBeUndefined()
  })
})
