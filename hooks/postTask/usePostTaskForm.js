// usePostTaskForm.js
// The post-a-task form (react-hook-form + the schemas in postTaskSchema): the task's category and job,
// its details, dates, place and contact, a repost's data, and sending it (usePostTaskSubmit). The data
// rules are in Helpers/postTaskData.
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { postTaskSchema, guestPostTaskSchema, POST_TASK_FIELDS, GUEST_FIELDS } from "./postTaskSchema"
import useTaskMedia from "./useTaskMedia"
import usePostTaskSubmit from "./usePostTaskSubmit"
import { loadTaskDraft } from "../../Services/taskDraft"
import useAppSettings from "../queries/useAppSettings"
import useLoadTask from "../queries/useLoadTask"
import useAlert from "../useAlert"
import useEvent from "../useEvent"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { defaultOptions, jobsOf, emptyValues, clearedValues, taskPayload, repostValues, formProblems } from "../../Helpers/postTaskData"

const usePostTaskForm = ({ params }) => {
  const appSettings = useAppSettings()
  const { showError } = useAlert()
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const userData = useAuthStore((state) => state.user.userData)
  const selectedCat = useUiStore((state) => state.selectedCat)
  const selectedJobId = useUiStore((state) => state.selectedJobId)
  const currentServiceId = useUiStore((state) => state.currentServiceId)
  const { setSelectedCat, setCurrentServiceId } = useUiStore.getState()
  const media = useTaskMedia()

  const form = useForm({
    defaultValues: emptyValues(),
    // the guest schema while logged out (the user may log in on this screen)
    resolver: (values, context, options) => zodResolver(useAuthStore.getState().user.loggedIn ? postTaskSchema : guestPostTaskSchema)(values, context, options)
  })
  const { setValue, getValues, watch } = form
  const subTask = watch("subTask")
  const useSavedPhone = watch("useSavedPhone")

  const jobs = jobsOf(appSettings.services, selectedCat)

  const chooseSubTask = (job, options = defaultOptions(job)) => {
    setValue("subTask", job)
    setValue("options", options)
  }

  // the job follows the category / job picked elsewhere (Home, the category slider); a job of the
  // chosen category stays chosen (e.g. the reposted one)
  useEffect(() => {
    if (!currentServiceId && appSettings.services?.length) setCurrentServiceId(appSettings.services[0].id)
  }, [currentServiceId, appSettings.services, setCurrentServiceId])

  // (the effects below run on their own triggers; their bodies see the latest form through useEvent)
  const followPickedJob = useEvent(() => {
    if (!jobs.length) return
    const picked = selectedJobId && jobs.find((job) => job.id === selectedJobId)
    if (picked) return chooseSubTask(picked)
    if (!jobs.some((job) => job.id === getValues("subTask").id)) chooseSubTask(jobs[0])
  })
  useEffect(() => {
    followPickedJob()
  }, [selectedCat, selectedJobId, appSettings.services, followPickedJob])

  // the user's first saved address; the saved phone only while they have one
  useEffect(() => {
    if (userData?.addresses?.length) setValue("address", userData.addresses[0])
    if (!userData?.mobile) setValue("useSavedPhone", false)
  }, [userData, setValue])

  const applySavedPhone = useEvent(() => {
    if (useSavedPhone && !userData?.mobile) {
      showError("common.verifyPhoneNumber", "usePostTaskForm.youDonTHaveVerifiedPhone")
      setValue("useSavedPhone", false)
      return
    }
    setValue("phone", useSavedPhone && userData?.mobile ? userData.mobile + "" : "")
  })
  useEffect(() => {
    applySavedPhone()
  }, [useSavedPhone, applySavedPhone])

  // "post this task again": the form starts from the old task
  const loadTask = useLoadTask({ errorTitle: "Task data load error", failed: "Task data could not be loaded, please try again later" })
  const repost = async (taskId) => {
    const task = await loadTask(taskId)
    if (!task) return
    const old = repostValues(task, { services: appSettings.services, savedPhone: userData?.mobile })
    Object.entries(old.values).forEach(([field, value]) => setValue(field, value))
    media.setFromTask(old.images)
    if (old.job) {
      chooseSubTask(old.job, old.options)
      setSelectedCat(old.category)
    }
  }

  // a guest's task kept while they registered: the form starts from it (posting it clears it)
  const resumeDraft = async () => {
    const draft = await loadTaskDraft()
    if (!draft) return
    if (draft.category !== null && draft.category !== undefined) setSelectedCat(draft.category)
    const { subTask, options, ...values } = draft.values
    Object.entries(values).forEach(([field, value]) => value !== undefined && setValue(field, value))
    if (subTask && subTask.id) chooseSubTask(subTask, options || defaultOptions(subTask))
    if (draft.media.length) media.restore(draft.media)
  }

  const applyParams = useEvent(() => {
    setValue("isSos", Boolean(params?.isSos))
    if (params?.repost) repost(params.repost)
    if (params?.draft) resumeDraft()
  })
  useEffect(() => {
    applyParams()
  }, [params, applyParams])

  const setOption = (id, value) =>
    setValue(
      "options",
      getValues("options").map((option) => (option.id === id ? { ...option, value } : option))
    )
  const toggleOption = (id) =>
    setValue(
      "options",
      getValues("options").map((option) => (option.id === id ? { ...option, value: option.value ? 0 : 1 } : option))
    )

  const { post, registerThenPost } = usePostTaskSubmit({
    onPosted: () => {
      form.reset(clearedValues(getValues()))
      media.clear()
    }
  })
  const payloadOf = (values) => taskPayload(values, { savedPhone: userData?.mobile, keptImages: media.keptFromTask() })

  const send = (values) => (loggedIn ? post(payloadOf(values), media.uploads()) : registerThenPost(values, media.uploads()))
  const refuse = (errors) => showError("usePostTaskForm.taskCreateError", formProblems(errors, loggedIn ? POST_TASK_FIELDS : GUEST_FIELDS))

  return { form, media, jobs, subTask, chooseSubTask, setOption, toggleOption, submit: form.handleSubmit(send, refuse) }
}

export default usePostTaskForm
