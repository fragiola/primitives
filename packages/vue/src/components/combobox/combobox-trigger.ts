import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ComboboxKey } from "./combobox-context.ts";
import type { ComboboxOpenState } from "./combobox-input.ts";

/** Toggles the list; not in the tab order, keeps focus in the input. */
export const ComboboxTrigger: PartComponent<
    Record<never, never>,
    ComboboxOpenState
> = publicComponent(
    defineComponent({
        name: "ComboboxTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ComboboxKey, "Combobox.Trigger");
            const setButton = elementSetter(context.button);
            return () => {
                const open = context.open.value;
                const disabled = context.disabled();
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open, disabled },
                    {
                        type: "button",
                        tabindex: -1,
                        disabled,
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": context.listId,
                        "data-primitives-part": "combobox-trigger",
                        ...stateAttributes({ "popup-open": open, disabled }),
                        onPointerdown: (event: PointerEvent) =>
                            event.preventDefault(),
                        onClick: (event: MouseEvent) => {
                            context.pendingHighlight.current = null;
                            context.setOpen(
                                !context.open.value,
                                "trigger-press",
                                event,
                            );
                            context.trigger.value?.focus();
                        },
                        ref: setButton,
                    },
                );
            };
        },
    }),
);
