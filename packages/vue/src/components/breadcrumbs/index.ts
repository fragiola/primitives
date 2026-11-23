// The entry of @fragiola/primitives-vue/breadcrumbs: the APG breadcrumb, a named `nav` of an
// ordered list of links to the parent pages, the current one marked (spec/breadcrumbs.md). Its
// Link shares Link's behaviour through the package's own code; its Ellipsis composes with a
// Menu's trigger in the app, never importing Menu.

export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    BreadcrumbsLinkProps,
    BreadcrumbsLinkState,
} from "./breadcrumbs-link.ts";
export { Breadcrumbs } from "./parts.ts";
