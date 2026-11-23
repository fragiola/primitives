import { BreadcrumbsCurrent } from "./breadcrumbs-current.tsx";
import { BreadcrumbsEllipsis } from "./breadcrumbs-ellipsis.tsx";
import { BreadcrumbsItem } from "./breadcrumbs-item.tsx";
import { BreadcrumbsLink } from "./breadcrumbs-link.tsx";
import { BreadcrumbsList } from "./breadcrumbs-list.tsx";
import { BreadcrumbsRoot } from "./breadcrumbs-root.tsx";
import { BreadcrumbsSeparator } from "./breadcrumbs-separator.tsx";

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
