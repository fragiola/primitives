// The entry of @fragiola/primitives-react/breadcrumbs: the APG breadcrumb, a named `nav` of an
// ordered list of links to the parent pages, the current one marked (spec/breadcrumbs.md). Its
// Link shares Link's behaviour through the package's own code; its Ellipsis composes with a
// Menu's trigger in the app, never importing Menu.

export type { RenderProp } from "../../utils/render-element.tsx";
export type { BreadcrumbsCurrentProps } from "./breadcrumbs-current.tsx";
export type { BreadcrumbsEllipsisProps } from "./breadcrumbs-ellipsis.tsx";
export type { BreadcrumbsItemProps } from "./breadcrumbs-item.tsx";
export type {
    BreadcrumbsLinkProps,
    BreadcrumbsLinkState,
} from "./breadcrumbs-link.tsx";
export type { BreadcrumbsListProps } from "./breadcrumbs-list.tsx";
export type { BreadcrumbsRootProps } from "./breadcrumbs-root.tsx";
export type { BreadcrumbsSeparatorProps } from "./breadcrumbs-separator.tsx";
export { Breadcrumbs } from "./parts.ts";
