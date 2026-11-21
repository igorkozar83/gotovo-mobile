// useQuestionForm.js
// The text of a question (or an answer) and the one picture that may go with it. validated(errorTitle)
// is true when the text is there; otherwise the user is told to write it.
import { useState } from "react"

import useAlert from "../useAlert"

const useQuestionForm = () => {
  const { showError } = useAlert()
  const [text, setText] = useState("")
  const [image, setImage] = useState(null)

  return {
    text,
    setText,
    image,
    setImage,
    removeImage: () => setImage(null),
    validated: (errorTitle) => {
      if (text) return true
      showError(errorTitle, "useQuestionForm.pleaseWriteAQuestion")
      return false
    },
    clear: () => {
      setText("")
      setImage(null)
    }
  }
}

export default useQuestionForm
