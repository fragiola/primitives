import type { MouseEvent } from "react";
import { stateAttributes } from "./state-attributes.ts";

export interface LinkBehaviour {
    disabled: boolean;
    current: boolean;
}

/** A disabled link's press: no navigation, and no handler after it (spec/link.md, "Pointer"). */
function stopPress(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * A link's attributes (spec/link.md), shared by Link and Breadcrumbs' Link (each framework's own
 * code, not the `/link` entry): `aria-current="page"` while current; while disabled
 * `aria-disabled="true"` and its click stopped in its capture phase, so neither the browser nor a
 * router's handler on the anchor navigates (Button's disabled-press rule, for an anchor).
 */
export function linkProps({
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
