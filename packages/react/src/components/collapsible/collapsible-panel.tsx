import { usePanelTransition } from "../../hooks/use-panel-transition.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CollapsibleContext,
    collapsibleAttributes,
} from "./collapsible-context.ts";

export interface CollapsiblePanelState {
    open: boolean;
    disabled: boolean;
    transitionStatus: "starting" | "ending" | undefined;
}

export interface CollapsiblePanelProps
    extends PartProps<CollapsiblePanelState> {
    /** Keep a closed panel in the DOM, `hidden` (default `false`). */
    keepMounted?: boolean;
    /** Keep a closed panel in the DOM, `hidden="until-found"`: find-in-page opens it. */
    hiddenUntilFound?: boolean;
}

/** The content shown and hidden, animatable with no layout jump (spec/collapsible.md). */
export function CollapsiblePanel({
    keepMounted = false,
    hiddenUntilFound = false,
    ...props
}: CollapsiblePanelProps) {
    const context = useRequiredContext(CollapsibleContext, "Collapsible.Panel");
    const { open, disabled } = context;
    const panel = usePanelTransition({
        open,
        prefix: "collapsible",
        keepMounted,
        hiddenUntilFound,
        onFound: () => context.setOpen(true, "none"),
    });
    if (!panel.rendered) {
        return null;
    }
    const state = { open, disabled, transitionStatus: panel.status };
    return renderElement(
        "div",
        props,
        state,
        {
            id: context.panelId,
            hidden: panel.hidden || undefined,
            "data-primitives-part": "collapsible-panel",
            ...stateAttributes({
                ...collapsibleAttributes({ open, disabled }),
                "starting-style": panel.status === "starting",
                "ending-style": panel.status === "ending",
            }),
            style: panel.style,
        },
        panel.ref,
    );
}
