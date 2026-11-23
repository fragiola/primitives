import {
    BreadcrumbsCurrent,
    BreadcrumbsEllipsis,
    BreadcrumbsItem,
    BreadcrumbsLink,
    BreadcrumbsList,
    BreadcrumbsRoot,
    BreadcrumbsSeparator,
} from "@fragiola/primitives-angular/breadcrumbs";

/** Every Breadcrumbs directive, for a scenario's `imports`. */
export const BREADCRUMBS_PARTS = [
    BreadcrumbsRoot,
    BreadcrumbsList,
    BreadcrumbsItem,
    BreadcrumbsLink,
    BreadcrumbsCurrent,
    BreadcrumbsSeparator,
    BreadcrumbsEllipsis,
];
