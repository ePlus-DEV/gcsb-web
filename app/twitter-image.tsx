import {
  createSocialImage,
  socialImageAlt,
  socialImageContentType,
  socialImageSize,
} from "./social-image"

export const alt = socialImageAlt
export const size = socialImageSize
export const contentType = socialImageContentType

/** Generates the default 1200×630 X/Twitter preview image. */
export default function TwitterImage() {
  return createSocialImage()
}
