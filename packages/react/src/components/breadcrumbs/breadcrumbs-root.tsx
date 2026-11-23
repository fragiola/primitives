import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export type BreadcrumbsRootProps = PartProps<Record<string, never>>;

/** The `nav` landmark of the trail; the app names it (`aria-label`) (spec/breadcrumbs.md). */
export function BreadcrumbsRoot(props: BreadcrumbsRootProps) {
    return renderElement(
        "nav",
        props,
        {},
        {
            "data-primitives-part": "breadcrumbs-root",
        },
    );
}
