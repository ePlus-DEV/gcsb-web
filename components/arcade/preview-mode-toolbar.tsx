"use client"

import { Globe2, Users } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import type { DashboardViewMode } from "./dashboard-state"

export default function PreviewModeToolbar({ viewMode, onChange, catalog }: {
  viewMode: DashboardViewMode
  onChange: (mode: DashboardViewMode) => void
  catalog: WebsiteCatalog
}) {
  const viewMessages = catalog.messages
  return (
    <aside className="preview-mode-toolbar" aria-label={viewMessages.dashboardView}>
      <span className="preview-mode-badge" aria-hidden="true">PR</span>
      <div className="dashboard-view-switch" role="group" aria-label={viewMessages.dashboardView}>
        <button
          type="button"
          className={viewMode === "guest" ? "is-active" : ""}
          aria-pressed={viewMode === "guest"}
          onClick={() => onChange("guest")}
        >
          <Globe2 />
          <span>{viewMessages.guestView}</span>
        </button>
        <button
          type="button"
          className={viewMode === "profile" ? "is-active" : ""}
          aria-pressed={viewMode === "profile"}
          onClick={() => onChange("profile")}
        >
          <Users />
          <span>{viewMessages.profileView}</span>
        </button>
      </div>
    </aside>
  )
}
