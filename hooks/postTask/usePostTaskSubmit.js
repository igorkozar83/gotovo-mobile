// usePostTaskSubmit.js
// Sending the post-a-task form: a logged-in user's task is posted (then My Tasks). A guest is registered
// from the form's account fields and their task kept as a draft (Services/taskDraft): the first sign-in,
// once the e-mail is confirmed, offers to go on posting it (useSession).
import { useNavigation } from "@react-navigation/native"

import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import { createTask } from "../../Services/TasksAPI"
import { accountFailure, apiError } from "../../Helpers/apiErrors"
import { translate } from "../../Helpers/language.utils"
import useRegisterAction from "../auth/useRegisterAction"
import { saveTaskDraft, clearTaskDraft } from "../../Services/taskDraft"
import useUiStore from "../../stores/uiStore"
import { showSuccessThen } from "../../stores/alerts"

// what the posted form misses (its times or options), as the server listed it in fields.form; null otherwise
const formProblems = (error) => {
  const failure = apiError(error)
  const form = failure && failure.fields && failure.fields.form
  return form && form.length ? { title: "Task create error", text: form.map((problem) => translate(problem)).join("\n") } : null
}

// onPosted(): clears the form after a task was posted
const usePostTaskSubmit = ({ onPosted }) => {
  const navigation = useNavigation()
  const { showError } = useAlert()
  const { doRegisterRequest } = useRegisterAction()

  const create = useApiAction(createTask, {
    invalid: (error) => formProblems(error) || accountFailure("usePostTaskSubmit.taskCreateError")(error),
    failed: "common.thereWasAnErrorWhileCreating",
    invalidate: [["myTasks"]],
    onSuccess: () => {
      showSuccessThen("usePostTaskSubmit.youHavePostedATask", "usePostTaskSubmit.loremIpsumDolorSitAmetOnsectetuer", () => navigation.navigate("MyTasks", { refresh: true }))
      onPosted()
      // a task resumed from a guest's draft is posted now
      clearTaskDraft()
    },
    // the server refused the task (an incomplete form is listed by `invalid`)
    onError: (error) => {
      const refusal = apiError(error)
      if (refusal && refusal.code !== "invalid") showError("usePostTaskSubmit.taskCreateError", refusal.message)
    }
  })

  // payload: the task as the API takes it; uploads: the picked photos and video
  const post = (payload, uploads) => create.run(payload, uploads)

  // values: the form's (its guest fields: the account); uploads: the picked photos and video. The task is kept,
  // then the account is registered (registered, the login opens with the e-mail filled in: useRegisterAction)
  const registerThenPost = async (values, uploads = []) => {
    await saveTaskDraft(values, useUiStore.getState().selectedCat, uploads)
    const { guest } = values
    doRegisterRequest({
      email: guest.email,
      password: guest.password,
      confirm_password: guest.confirmPassword,
      full_name: guest.name,
      last_name: guest.lastName,
      lang: useUiStore.getState().language,
      // the address entered for the task becomes the new account's, so the resumed task has it (the form picks the
      // user's first address); none entered: none sent
      ...(values.newAddress ? { address: values.newAddress } : {})
    })
  }

  return { post, registerThenPost }
}

export default usePostTaskSubmit
