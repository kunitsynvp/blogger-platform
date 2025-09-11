export const blogConstraints = {
  nameMinLength: 0,
  nameMaxLength: 15,

  descriptionMinLength: 0,
  descriptionMaxLength: 500,

  websiteUrlMinLength: 0,
  websiteUrlMaxLength: 100,
  webSiteUrlMatch: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
}
export const blogDBConstraints = {
  nameMaxLength: 30,
  descriptionMaxLength: 1000,
  websiteUrlMaxLength: 200,
}
