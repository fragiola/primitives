import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export type BreadcrumbsCurrentProps = PartProps<Record<string, never>>;

/** The current page when it is no link: `aria-current="page"` (spec/breadcrumbs.md). */
export function BreadcrumbsCurrent(props: BreadcrumbsCurrentProps) {
    return renderElement(
        "span",
        props,
        {},
        {
            "aria-current": "page",
            "data-primitives-part": "breadcrumbs-current",
        },
    );
}
