import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ARCADE_SWAG_TIERS, getSwagDrop, getSwagDropsForSeason, type ArcadeSwagTier } from "@/components/arcade/swag-drops"
import { CURRENT_SWAG_SEASON, SWAG_TIER_META, swagProductPath, swagTierPath } from "@/components/arcade/swag-seasons"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

import TierPage from "@/components/swag/tier-page"
import ProductPage from "@/components/swag/product-page"

const season = CURRENT_SWAG_SEASON

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return [
    ...ARCADE_SWAG_TIERS.map((slug) => ({ slug })),
    ...getSwagDropsForSeason(season).map((drop) => ({ slug: drop.id })),
  ]
}

function isTier(slug: string): slug is ArcadeSwagTier {
  return ARCADE_SWAG_TIERS.includes(slug as ArcadeSwagTier)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (isTier(slug)) {
    const meta = SWAG_TIER_META[slug]
    const canonical = new URL(swagTierPath(season, slug), WEBSITE_SITE_URL).toString()
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical },
      openGraph: { title: meta.title, description: meta.description, url: canonical, type: "website" },
      twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    }
  }

  const drop = getSwagDrop(season, slug)
  if (!drop) return {}

  const title = `Google Skills Arcade ${drop.shortName} ${season}`
  const description = `${drop.summary} See eligible ${season} tiers, reveal date, features, live prize-slot availability, and the official Google announcement.`
  const canonical = new URL(swagProductPath(season, drop.id), WEBSITE_SITE_URL).toString()
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: drop.imageUrl, alt: drop.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [drop.imageUrl] },
  }
}

export default async function SwagDetailPage({ params }: Props) {
  const { slug } = await params
  if (isTier(slug)) return <TierPage tier={slug} />
  if (getSwagDrop(season, slug)) return <ProductPage slug={slug} />
  notFound()
}
