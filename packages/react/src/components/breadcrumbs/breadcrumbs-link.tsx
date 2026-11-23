import { linkProps } from "../../utils/link-props.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export interface BreadcrumbsLinkState {
    disabled: boolean;
    current: boolean;
}

export interface BreadcrumbsLinkProps extends PartProps<BreadcrumbsLinkState> {
    /** It links to the current page: `aria-current="page"`. */
    current?: boolean;
    /** The link is unavailable, as Link's (spec/link.md). */
    disabled?: boolean;
}

/** A parent page of the trail (spec/breadcrumbs.md): Link's behaviour (spec/link.md). */
export function BreadcrumbsLink({
    current = false,
    disabled = false,
    ...props
}: BreadcrumbsLinkProps) {
    return renderElement(
        "a",
        props,
        { disabled, current },
        {
            ...linkProps({ disabled, current }),
            "data-primitives-part": "breadcrumbs-link",
        },
    );
}
