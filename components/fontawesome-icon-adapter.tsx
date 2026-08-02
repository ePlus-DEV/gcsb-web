import * as React from "react"

export type LucideProps = React.HTMLAttributes<HTMLElement> & {
  size?: number | string
  color?: string
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
  width?: number | string
  height?: number | string
  fill?: string
}

export type LucideIcon = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<HTMLElement>
>

function createFontAwesomeIcon(
  displayName: string,
  iconClass: string,
  options: { spin?: boolean } = {},
): LucideIcon {
  const Icon = React.forwardRef<HTMLElement, LucideProps>(
    (
      {
        className,
        size,
        color,
        strokeWidth: _strokeWidth,
        absoluteStrokeWidth: _absoluteStrokeWidth,
        width,
        height,
        fill: _fill,
        style,
        ...props
      },
      ref,
    ) => {
      const resolvedWidth = width ?? size
      const resolvedHeight = height ?? size

      return (
        <i
          ref={ref}
          className={[
            "fa-icon",
            iconClass,
            options.spin ? "fa-spin" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            color,
            width: resolvedWidth,
            height: resolvedHeight,
            fontSize: size,
            lineHeight: 1,
            textAlign: "center",
            ...style,
          }}
          aria-hidden={props["aria-label"] ? undefined : true}
          {...props}
        />
      )
    },
  )

  Icon.displayName = displayName
  return Icon
}

export const Accordion = createFontAwesomeIcon("Accordion", "fa-solid fa-bars-staggered")
export const AlertCircle = createFontAwesomeIcon("AlertCircle", "fa-solid fa-circle-exclamation")
export const ArrowDown = createFontAwesomeIcon("ArrowDown", "fa-solid fa-arrow-down")
export const ArrowLeft = createFontAwesomeIcon("ArrowLeft", "fa-solid fa-arrow-left")
export const ArrowRight = createFontAwesomeIcon("ArrowRight", "fa-solid fa-arrow-right")
export const ArrowUp = createFontAwesomeIcon("ArrowUp", "fa-solid fa-arrow-up")
export const BadgeCheck = createFontAwesomeIcon("BadgeCheck", "fa-solid fa-circle-check")
export const Bell = createFontAwesomeIcon("Bell", "fa-solid fa-bell")
export const BookOpen = createFontAwesomeIcon("BookOpen", "fa-solid fa-book-open")
export const BookOpenCheck = createFontAwesomeIcon("BookOpenCheck", "fa-solid fa-book-open-reader")
export const Calendar = createFontAwesomeIcon("Calendar", "fa-solid fa-calendar-days")
export const Check = createFontAwesomeIcon("Check", "fa-solid fa-check")
export const CheckCircle = createFontAwesomeIcon("CheckCircle", "fa-solid fa-circle-check")
export const CheckCircle2 = CheckCircle
export const ChevronDown = createFontAwesomeIcon("ChevronDown", "fa-solid fa-chevron-down")
export const ChevronLeft = createFontAwesomeIcon("ChevronLeft", "fa-solid fa-chevron-left")
export const ChevronRight = createFontAwesomeIcon("ChevronRight", "fa-solid fa-chevron-right")
export const ChevronUp = createFontAwesomeIcon("ChevronUp", "fa-solid fa-chevron-up")
export const ChevronsUpDown = createFontAwesomeIcon("ChevronsUpDown", "fa-solid fa-sort")
export const Chrome = createFontAwesomeIcon("Chrome", "fa-brands fa-chrome")
export const Circle = createFontAwesomeIcon("Circle", "fa-regular fa-circle")
export const CircleCheck = createFontAwesomeIcon("CircleCheck", "fa-regular fa-circle-check")
export const CircleHelp = createFontAwesomeIcon("CircleHelp", "fa-regular fa-circle-question")
export const CircleX = createFontAwesomeIcon("CircleX", "fa-regular fa-circle-xmark")
export const Clock = createFontAwesomeIcon("Clock", "fa-regular fa-clock")
export const Cloud = createFontAwesomeIcon("Cloud", "fa-solid fa-cloud")
export const Copy = createFontAwesomeIcon("Copy", "fa-regular fa-copy")
export const Download = createFontAwesomeIcon("Download", "fa-solid fa-download")
export const Dot = createFontAwesomeIcon("Dot", "fa-solid fa-circle")
export const ExternalLink = createFontAwesomeIcon("ExternalLink", "fa-solid fa-arrow-up-right-from-square")
export const Eye = createFontAwesomeIcon("Eye", "fa-regular fa-eye")
export const File = createFontAwesomeIcon("File", "fa-regular fa-file")
export const FileText = createFontAwesomeIcon("FileText", "fa-regular fa-file-lines")
export const Gamepad2 = createFontAwesomeIcon("Gamepad2", "fa-solid fa-gamepad")
export const Github = createFontAwesomeIcon("Github", "fa-brands fa-github")
export const Globe = createFontAwesomeIcon("Globe", "fa-solid fa-globe")
export const Globe2 = createFontAwesomeIcon("Globe2", "fa-brands fa-firefox-browser")
export const GraduationCap = createFontAwesomeIcon("GraduationCap", "fa-solid fa-graduation-cap")
export const Grip = createFontAwesomeIcon("Grip", "fa-solid fa-grip")
export const GripVertical = createFontAwesomeIcon("GripVertical", "fa-solid fa-grip-vertical")
export const Heart = createFontAwesomeIcon("Heart", "fa-regular fa-heart")
export const Home = createFontAwesomeIcon("Home", "fa-solid fa-house")
export const Info = createFontAwesomeIcon("Info", "fa-solid fa-circle-info")
export const Loader2 = createFontAwesomeIcon("Loader2", "fa-solid fa-circle-notch", { spin: true })
export const LoaderCircle = createFontAwesomeIcon("LoaderCircle", "fa-solid fa-circle-notch", { spin: true })
export const Lock = createFontAwesomeIcon("Lock", "fa-solid fa-lock")
export const LogOut = createFontAwesomeIcon("LogOut", "fa-solid fa-right-from-bracket")
export const Mail = createFontAwesomeIcon("Mail", "fa-regular fa-envelope")
export const Menu = createFontAwesomeIcon("Menu", "fa-solid fa-bars")
export const Minus = createFontAwesomeIcon("Minus", "fa-solid fa-minus")
export const MoreHorizontal = createFontAwesomeIcon("MoreHorizontal", "fa-solid fa-ellipsis")
export const MoreVertical = createFontAwesomeIcon("MoreVertical", "fa-solid fa-ellipsis-vertical")
export const PanelLeft = createFontAwesomeIcon("PanelLeft", "fa-solid fa-table-columns")
export const Plus = createFontAwesomeIcon("Plus", "fa-solid fa-plus")
export const RefreshCcw = createFontAwesomeIcon("RefreshCcw", "fa-solid fa-rotate-left")
export const RotateCcw = createFontAwesomeIcon("RotateCcw", "fa-solid fa-rotate-left")
export const Search = createFontAwesomeIcon("Search", "fa-solid fa-magnifying-glass")
export const Settings = createFontAwesomeIcon("Settings", "fa-solid fa-gear")
export const Shield = createFontAwesomeIcon("Shield", "fa-solid fa-shield")
export const ShieldCheck = createFontAwesomeIcon("ShieldCheck", "fa-solid fa-shield-halved")
export const Sparkles = createFontAwesomeIcon("Sparkles", "fa-solid fa-wand-magic-sparkles")
export const Star = createFontAwesomeIcon("Star", "fa-solid fa-star")
export const Trash = createFontAwesomeIcon("Trash", "fa-solid fa-trash")
export const Trash2 = Trash
export const Trophy = createFontAwesomeIcon("Trophy", "fa-solid fa-trophy")
export const User = createFontAwesomeIcon("User", "fa-regular fa-user")
export const Users = createFontAwesomeIcon("Users", "fa-solid fa-users")
export const X = createFontAwesomeIcon("X", "fa-solid fa-xmark")
export const XCircle = createFontAwesomeIcon("XCircle", "fa-regular fa-circle-xmark")
