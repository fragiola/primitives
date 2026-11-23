import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteKey } from "./autocomplete-context.ts";

export interface AutocompleteDisabledState {
    disabled: boolean;
}

/** Empties the text; rendered only while there is text (spec/autocomplete.md). */
export const AutocompleteClear: PartComponent<
    Record<never, never>,
    AutocompleteDisabledState
> = publicComponent(
    defineComponent({
        name: "AutocompleteClear",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.Clear",
            );
            const setClearButton = elementSetter(context.clearButton);
            return () => {
                if (context.value.value === "") {
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
                        "data-primitives-part": "autocomplete-clear",
                        ...stateAttributes({ disabled }),
                        onPointerdown: (event: PointerEvent) =>
                            event.preventDefault(),
                        onClick: (event: MouseEvent) => {
                            context.clear("clear-press", event);
                            if (
                                context.open.value &&
                                !context.openOnInputClick()
                            ) {
                                context.setOpen(false, "input-clear", event);
                            }
                            context.trigger.value?.focus();
                        },
                        ref: setClearButton,
                    },
                );
            };
        },
    }),
);
