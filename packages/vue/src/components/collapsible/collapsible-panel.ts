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
    CollapsibleKey,
    collapsibleAttributes,
} from "./collapsible-context.ts";

export interface CollapsiblePanelState {
    open: boolean;
    disabled: boolean;
    transitionStatus: PanelStatus;
}

export interface CollapsiblePanelProps {
    /** Keep a closed panel in the DOM, `hidden` (default `false`). */
    keepMounted?: boolean;
    /** Keep a closed panel in the DOM, `hidden="until-found"`: find-in-page opens it. */
    hiddenUntilFound?: boolean;
}

/** The content shown and hidden, animatable with no layout jump (spec/collapsible.md). */
export const CollapsiblePanel: PartComponent<
    CollapsiblePanelProps,
    CollapsiblePanelState
> = publicComponent(
    defineComponent({
        name: "CollapsiblePanel",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Keep a closed panel in the DOM, `hidden` (default `false`). */
            keepMounted: { type: Boolean, default: false },
            /** Keep a closed panel in the DOM, `hidden="until-found"`. */
            hiddenUntilFound: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CollapsibleKey,
                "Collapsible.Panel",
            );
            const panel = usePanelTransition({
                open: () => context.state.value.open,
                prefix: "collapsible",
                keepMounted: () => props.keepMounted,
                hiddenUntilFound: () => props.hiddenUntilFound,
                onFound: () => context.setOpen(true, "none"),
            });
            return () => {
                if (!panel.rendered()) {
                    return null;
                }
                const { open, disabled } = context.state.value;
                const status = panel.status();
                const state = { open, disabled, transitionStatus: status };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    id: context.panelId,
                    hidden: panel.hidden(),
                    "data-primitives-part": "collapsible-panel",
                    ...stateAttributes({
                        ...collapsibleAttributes({ open, disabled }),
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
