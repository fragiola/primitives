import { linkProps } from "../../utils/link-props.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";

export interface LinkState {
    disabled: boolean;
    current: boolean;
}

export interface LinkProps extends PartProps<LinkState> {
    /** The link is unavailable: `aria-disabled`, and its press navigates nowhere. */
    disabled?: boolean;
    /** It links to the page the app is on: `aria-current="page"`. */
    current?: boolean;
}

/**
 * A link with a disabled and a current state (spec/link.md): the app's anchor, or its router's
 * link through `render` (any component that renders an anchor with the props it is given).
 */
export function Link({
    disabled = false,
    current = false,
    ...props
}: LinkProps) {
    return renderElement(
        "a",
        props,
        { disabled, current },
        {
            ...linkProps({ disabled, current }),
            "data-primitives-part": "link-root",
        },
    );
}
