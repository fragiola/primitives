import { defineComponent } from "vue";
import {
    type PanelStatus,
    usePanelTransition,
} from "../../composables/use-panel-transition.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionItemKey,
    type AccordionOrientation,
    itemAttributes,
} from "./accordion-context.ts";

export interface AccordionPanelState {
    open: boolean;
    disabled: boolean;
    orientation: AccordionOrientation;
    transitionStatus: PanelStatus;
}

export interface AccordionPanelProps {
    /** Keep a closed panel in the DOM, `hidden` (default `false`). */
    keepMounted?: boolean;
    /** Keep a closed panel in the DOM, `hidden="until-found"`: find-in-page opens it. */
    hiddenUntilFound?: boolean;
}

/** A section's content, a `region` named by its Trigger (spec/accordion.md). */
export const AccordionPanel: PartComponent<
    AccordionPanelProps,
    AccordionPanelState
> = publicComponent(
    defineComponent({
        name: "AccordionPanel",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Keep a closed panel in the DOM, `hidden` (default `false`). */
            keepMounted: { type: Boolean, default: false },
            /** Keep a closed panel in the DOM, `hidden="until-found"`. */
            hiddenUntilFound: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                AccordionItemKey,
                "Accordion.Panel",
            );
            const panel = usePanelTransition({
                open: () => item.state.value.open,
                prefix: "accordion",
                keepMounted: () => props.keepMounted,
                hiddenUntilFound: () => props.hiddenUntilFound,
                onFound: () => item.setOpen(true, "none"),
            });
            return () => {
                if (!panel.rendered()) {
                    return null;
                }
                const { open, disabled, orientation } = item.state.value;
                const status = panel.status();
                const state = {
                    open,
                    disabled,
                    orientation,
                    transitionStatus: status,
                };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    role: "region",
                    id: item.panelId(),
                    "aria-labelledby": item.triggerId(),
                    hidden: panel.hidden(),
                    "data-primitives-part": "accordion-panel",
                    ...stateAttributes({
                        ...itemAttributes({ open, disabled }),
                        orientation,
                        "starting-style": status === "starting",
                        "ending-style": status === "ending",
                    }),
                    style: panel.style(),
                    ref: panel.setElement,
                });
            };
        },
    }),
);
