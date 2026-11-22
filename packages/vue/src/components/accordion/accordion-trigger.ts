import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionItemKey,
    type AccordionItemState,
} from "./accordion-context.ts";

/** A header's button (spec/accordion.md): Enter and Space through its native click. */
export const AccordionTrigger: PartComponent<
    Record<never, never>,
    AccordionItemState
> = publicComponent(
    defineComponent({
        name: "AccordionTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                AccordionItemKey,
                "Accordion.Trigger",
            );
            const onClick = () => {
                const { open, disabled } = item.state.value;
                if (!disabled) {
                    item.setOpen(!open, "trigger-press");
                }
            };
            return () => {
                const state = item.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    id: item.triggerId(),
                    "aria-expanded": state.open ? "true" : "false",
                    "aria-controls": state.open ? item.panelId() : undefined,
                    disabled: state.disabled || undefined,
                    "data-primitives-part": "accordion-trigger",
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
