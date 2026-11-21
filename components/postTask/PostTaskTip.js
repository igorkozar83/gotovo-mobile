// PostTaskTip.js
// The post-a-task screen's question mark with its help text (looked up in the stored translations).
import React, { useState } from "react"

import TooltipWithQuestionMark from "../ui/TooltipWithQuestionMark"
import useStoredTranslations from "../../hooks/useStoredTranslations"
import useUiStore from "../../stores/uiStore"

const PostTaskTip = ({ textKey }) => {
  const [visible, setVisible] = useState(false)
  const translations = useStoredTranslations()
  const language = useUiStore((state) => state.language)

  return (
    <TooltipWithQuestionMark
      transl={translations}
      language={language}
      tooltipTextKey={textKey}
      visible={visible}
      onClose={() => setVisible(false)}
      onOpen={() => setVisible(true)}
    />
  )
}

export default PostTaskTip
