import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export type BreadcrumbsListProps = PartProps<Record<string, never>>;

/** The trail, an ordered list (spec/breadcrumbs.md). */
export function BreadcrumbsList(props: BreadcrumbsListProps) {
    return renderElement(
        "ol",
        props,
        {},
        {
            "data-primitives-part": "breadcrumbs-list",
        },
    );
}
