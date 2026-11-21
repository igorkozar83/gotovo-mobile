import { mediaProblems } from "../media"

describe("mediaProblems", () => {
  it("accepts a small photo and a short video", () => {
    expect(mediaProblems({ fileSize: 2 * 1024 * 1024 })).toBe("")
    expect(mediaProblems({ fileSize: 10 * 1024 * 1024, duration: 59000 })).toBe("")
    expect(mediaProblems({})).toBe("")
  })

  it("refuses a file over 30 MB and a video over 60 s", () => {
    expect(mediaProblems({ fileSize: 31 * 1024 * 1024, duration: 61000 })).toBe("Maximum file size is 30MB\nMaximum length of video is 60 seconds.")
  })
})
