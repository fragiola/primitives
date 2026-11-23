import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export type BreadcrumbsEllipsisProps = PartProps<Record<string, never>>;

/** The collapsed middle of the trail: a native button the app names and composes with a Menu's trigger (spec/breadcrumbs.md). */
export function BreadcrumbsEllipsis(props: BreadcrumbsEllipsisProps) {
    return renderElement(
        "button",
        props,
        {},
        {
            type: "button",
            "data-primitives-part": "breadcrumbs-ellipsis",
        },
    );
}
