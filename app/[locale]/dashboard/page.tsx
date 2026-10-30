import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import DashboardPage from "@/components/arcade/dashboard-page"
import { WEBSITE_LOCALES, getWebsiteLocaleHref, type WebsiteCatalog } from "@/lib/website-i18n"
export const dynamicParams = false
export function generateStaticParams() {
  return WEBSITE_LOCALES.filter(item => item.path).map(item => ({locale: item.path}))
}
type Props = {params: Promise<{locale: string}>}
async function resolve(params: Props["params"]) {
  const {locale: segment} = await params
  const info = WEBSITE_LOCALES.find(item => item.path && item.path === segment)
  if (!info) notFound()
  const catalog = JSON.parse(await readFile(path.join(process.cwd(), "public/i18n/locales", `${info.code}.json`), "utf8")) as WebsiteCatalog
  return {info, catalog}
}
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {info, catalog} = await resolve(params)
  return {title: catalog.messages.dashboardNav, robots: {index: false, follow: true}, alternates: {canonical: `https://arcade.eplus.dev${getWebsiteLocaleHref(info.code)}dashboard/`}}
}
export default async function Page({params}: Props) {
  const {info, catalog} = await resolve(params)
  return <DashboardPage catalog={catalog} locale={info.code} />
}
