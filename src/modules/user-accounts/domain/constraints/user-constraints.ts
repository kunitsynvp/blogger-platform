export const loginDBConstraints = {
  minLength: 1,
  maxLength: 20,
}
export const passwordDBConstraints = {

}
export const emailDBConstraints = {
  minLength: 5,
  maxLength: 100,
}
export const loginConstraints = {
  minLength: 5,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};