// The entry of @fragiola/primitives-angular/breadcrumbs: the APG breadcrumb, a named `nav` of an
// ordered list of links to the parent pages, the current one marked (spec/breadcrumbs.md), as
// standalone attribute directives on the consumer's own elements. Its Link shares Link's behaviour
// through the package's `/internal`; its Ellipsis sits with a Menu's trigger on the app's button,
// never importing Menu.

export { BreadcrumbsCurrent } from "./directives/breadcrumbs-current.directive.ts";
export { BreadcrumbsEllipsis } from "./directives/breadcrumbs-ellipsis.directive.ts";
export { BreadcrumbsItem } from "./directives/breadcrumbs-item.directive.ts";
export {
    BreadcrumbsLink,
    type BreadcrumbsLinkState,
} from "./directives/breadcrumbs-link.directive.ts";
export { BreadcrumbsList } from "./directives/breadcrumbs-list.directive.ts";
export { BreadcrumbsRoot } from "./directives/breadcrumbs-root.directive.ts";
export { BreadcrumbsSeparator } from "./directives/breadcrumbs-separator.directive.ts";
