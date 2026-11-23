import { BreadcrumbsCurrent } from "./breadcrumbs-current.ts";
import { BreadcrumbsEllipsis } from "./breadcrumbs-ellipsis.ts";
import { BreadcrumbsItem } from "./breadcrumbs-item.ts";
import { BreadcrumbsLink } from "./breadcrumbs-link.ts";
import { BreadcrumbsList } from "./breadcrumbs-list.ts";
import { BreadcrumbsRoot } from "./breadcrumbs-root.ts";
import { BreadcrumbsSeparator } from "./breadcrumbs-separator.ts";

/** spec/breadcrumbs.md */
export const Breadcrumbs = {
    Root: BreadcrumbsRoot,
    List: BreadcrumbsList,
    Item: BreadcrumbsItem,
    Link: BreadcrumbsLink,
    Current: BreadcrumbsCurrent,
    Separator: BreadcrumbsSeparator,
    Ellipsis: BreadcrumbsEllipsis,
};
