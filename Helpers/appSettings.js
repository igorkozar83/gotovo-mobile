// Shapes the /settings response for the app.

// category buttons (the featured category gets id 0: selectedCat 0 means "featured")
const toButton = (category) => ({
  id: category.is_featured ? 0 : category.id,
  image: category.image,
  imageOrange: category.image_orange,
  text: category.title,
  postTaskImage: category.task_image,
  postTaskImageSelected: category.task_image_selected
})

// the services (sub categories) of the non-featured categories
const toServices = (category) =>
  !category.is_featured && category.sub_categories
    ? category.sub_categories.map((serv) => ({
        id: serv.id,
        categoryId: category.id,
        featured: serv.featured ? 1 : 0,
        image: serv.image,
        blackText: serv.black_text,
        additionalText: serv.additional_text,
        topImage: serv.top_image,
        bottomImage: serv.bottom_image,
        topDescription: serv.top_description,
        middleDescription: serv.middle_description,
        bottomDescription: serv.bottom_description,
        options: (serv.options || []).map((opt) => ({ name: opt.description, value: opt.price })),
        tasks: [...(serv.tasks || [])]
      }))
    : []

export const toAppSettings = (resp) => {
  const categories = resp.categories || []
  return {
    buttons: categories.map(toButton),
    services: categories.flatMap(toServices),
    clientSlider: resp.client_sliders,
    taskerSlider: resp.tasker_sliders,
    // the fee comes as "a,b,c"
    settings: { ...resp.settings, fee: resp.settings.fee.split(",") },
    translations: resp.translations,
    // the oldest app version the API still serves (an older one must update)
    minAppVersion: resp.min_app_version || null
  }
}
