import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export type BreadcrumbsItemProps = PartProps<Record<string, never>>;

/** One step of the trail (spec/breadcrumbs.md). */
export function BreadcrumbsItem(props: BreadcrumbsItemProps) {
    return renderElement(
        "li",
        props,
        {},
        {
            "data-primitives-part": "breadcrumbs-item",
        },
    );
}
