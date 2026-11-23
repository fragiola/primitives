import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export type BreadcrumbsSeparatorProps = PartProps<Record<string, never>>;

/** Between two Items: a list item hidden from assistive technology, its children the app's (spec/breadcrumbs.md). */
export function BreadcrumbsSeparator(props: BreadcrumbsSeparatorProps) {
    return renderElement(
        "li",
        props,
        {},
        {
            "aria-hidden": "true",
            "data-primitives-part": "breadcrumbs-separator",
        },
    );
}
