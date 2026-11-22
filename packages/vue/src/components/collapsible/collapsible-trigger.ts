import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CollapsibleKey,
    type CollapsibleState,
} from "./collapsible-context.ts";

/** The disclosure button (spec/collapsible.md): Enter and Space through its native click. */
export const CollapsibleTrigger: PartComponent<
    Record<never, never>,
    CollapsibleState
> = publicComponent(
    defineComponent({
        name: "CollapsibleTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CollapsibleKey,
                "Collapsible.Trigger",
            );
            const onClick = () => {
                const { open, disabled } = context.state.value;
                if (!disabled) {
                    context.setOpen(!open, "trigger-press");
                }
            };
            return () => {
                const state = context.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    "aria-expanded": state.open ? "true" : "false",
                    "aria-controls": state.open ? context.panelId : undefined,
                    disabled: state.disabled || undefined,
                    "data-primitives-part": "collapsible-trigger",
                    ...stateAttributes({
                        disabled: state.disabled,
                        "panel-open": state.open,
                    }),
                    onClick,
                });
            };
        },
    }),
);
