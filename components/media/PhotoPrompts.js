// PhotoPrompts.js
// The prompts around a list of picked photos: the picker to add one, a photo full screen, and the
// confirmation to remove one. usePhotoPrompts says which is open (one at a time).
import React, { useState } from "react"

import NewPictureAndVideoModal from "../modals/NewPictureAndVideoModal"
import ImageFullScreen from "./ImageFullScreen"
import RemoveImage from "./RemoveImage"
import { isImage } from "../../Helpers"

export const usePhotoPrompts = () => {
  // null, { kind: "pick" }, { kind: "preview", uri } or { kind: "remove", index }
  const [prompt, setPrompt] = useState(null)
  return {
    prompt,
    pick: () => setPrompt({ kind: "pick" }),
    preview: (uri) => setPrompt({ kind: "preview", uri }),
    remove: (index) => setPrompt({ kind: "remove", index }),
    close: () => setPrompt(null)
  }
}

/**
 * prompts: from usePhotoPrompts; photos: [{ uri }]
 * onPick(asset): a picked photo (or video); onRemove(index): the removal was confirmed
 * onClosed(kind): after a prompt closed, e.g. to bring back a modal that stepped aside for it
 * pickerProps: more props for the picker (onlyImages, disableVideoUpload, ...)
 */
const PhotoPrompts = ({ prompts, photos, onPick, onRemove, onClosed, pickerProps }) => {
  const { prompt } = prompts
  const kind = prompt && prompt.kind
  const removing = kind === "remove" ? photos[prompt.index] : null

  const close = () => {
    prompts.close()
    if (onClosed) onClosed(kind)
  }

  return (
    <>
      <NewPictureAndVideoModal visible={kind === "pick"} onClose={close} onPick={onPick} {...pickerProps} />
      <ImageFullScreen visible={kind === "preview"} onClose={close} image={kind === "preview" ? prompt.uri : null} />
      <RemoveImage
        visible={kind === "remove"}
        onClose={close}
        image={removing ? removing.uri : ""}
        notImage={removing ? !isImage(removing.uri) : false}
        onRemove={() => {
          onRemove(prompt.index)
          close()
        }}
      />
    </>
  )
}

export default PhotoPrompts
