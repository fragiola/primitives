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

export interface ComboboxDisabledState {
    disabled: boolean;
}

/** Clears the text and the value; rendered only while there is a value (spec/combobox.md). */
export const ComboboxClear: PartComponent<
    Record<never, never>,
    ComboboxDisabledState
> = publicComponent(
    defineComponent({
        name: "ComboboxClear",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ComboboxKey, "Combobox.Clear");
            const setClearButton = elementSetter(context.clearButton);
            return () => {
                if (context.values.value.length === 0) {
                    return null;
                }
                const disabled = context.disabled();
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { disabled },
                    {
                        type: "button",
                        tabindex: -1,
                        disabled,
                        "data-primitives-part": "combobox-clear",
                        ...stateAttributes({ disabled }),
                        onPointerdown: (event: PointerEvent) =>
                            event.preventDefault(),
                        onClick: () => {
                            context.clear("clear-press");
                            context.trigger.value?.focus();
                        },
                        ref: setClearButton,
                    },
                );
            };
        },
    }),
);
