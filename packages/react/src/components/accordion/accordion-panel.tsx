import { usePanelTransition } from "../../hooks/use-panel-transition.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionItemContext,
    type AccordionOrientation,
    itemAttributes,
} from "./accordion-context.ts";

export interface AccordionPanelState {
    open: boolean;
    disabled: boolean;
    orientation: AccordionOrientation;
    transitionStatus: "starting" | "ending" | undefined;
}

export interface AccordionPanelProps extends PartProps<AccordionPanelState> {
    /** Keep a closed panel in the DOM, `hidden` (default `false`). */
    keepMounted?: boolean;
    /** Keep a closed panel in the DOM, `hidden="until-found"`: find-in-page opens it. */
    hiddenUntilFound?: boolean;
}

/** A section's content, a `region` named by its Trigger (spec/accordion.md). */
export function AccordionPanel({
    keepMounted = false,
    hiddenUntilFound = false,
    ...props
}: AccordionPanelProps) {
    const item = useRequiredContext(AccordionItemContext, "Accordion.Panel");
    const { open, disabled, orientation } = item;
    const panel = usePanelTransition({
        open,
        prefix: "accordion",
        keepMounted,
        hiddenUntilFound,
        onFound: () => item.setOpen(true, "none"),
    });
    if (!panel.rendered) {
        return null;
    }
    const state = {
        open,
        disabled,
        orientation,
        transitionStatus: panel.status,
    };
    return renderElement(
        "div",
        props,
        state,
        {
            role: "region",
            id: item.panelId,
            "aria-labelledby": item.triggerId,
            hidden: panel.hidden || undefined,
            "data-primitives-part": "accordion-panel",
            ...stateAttributes({
                ...itemAttributes({ open, disabled }),
                orientation,
                "starting-style": panel.status === "starting",
                "ending-style": panel.status === "ending",
            }),
            style: panel.style,
        },
        panel.ref,
    );
}
