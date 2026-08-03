import { createSocialImage } from "./social-image"

export const dynamic = "force-static"
export const alt =
  "Arcade Points — Google Cloud Arcade score calculator, badge tracker and reward tier dashboard"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Generates the default 1200×630 Open Graph preview image. */
export default function OpenGraphImage() {
  return createSocialImage()
}
