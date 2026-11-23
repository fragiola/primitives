import { stateAttributes } from "./state-attributes.ts";

export interface LinkBehaviour {
    disabled: boolean;
    current: boolean;
}

/** A disabled link's press: no navigation, and no listener after it (spec/link.md, "Pointer"). */
function stopPress(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}

/**
 * A link's attributes (spec/link.md), shared by Link and Breadcrumbs' Link (the package's own code,
 * not the `/link` entry): `aria-current="page"` while current; while disabled
 * `aria-disabled="true"` and its click stopped in its capture phase, so neither the browser nor a
 * router's listener on the anchor (Vue Router's `RouterLink`) navigates (Button's disabled-press
 * rule, for an anchor).
 */
export function linkAttributes({
    disabled,
    current,
}: LinkBehaviour): Record<string, unknown> {
    return {
        "aria-disabled": disabled ? "true" : undefined,
        "aria-current": current ? "page" : undefined,
        onClickCapture: disabled ? stopPress : undefined,
        ...stateAttributes({ disabled, current }),
    };
}
