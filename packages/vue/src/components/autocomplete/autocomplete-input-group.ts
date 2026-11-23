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
import type { AutocompleteOpenState } from "./autocomplete-input.ts";

/**
 * Holds the Input and its buttons; anchors the list. A press on it, outside its buttons and the
 * input, focuses the input (and opens the list with `open-on-input-click`).
 */
export const AutocompleteInputGroup: PartComponent<
    Record<never, never>,
    AutocompleteOpenState
> = publicComponent(
    defineComponent({
        name: "AutocompleteInputGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.InputGroup",
            );
            const setInputGroup = elementSetter(context.inputGroup);
            const onMousedown = (event: MouseEvent) => {
                const target = event.target as Element | null;
                if (
                    target === null ||
                    target === context.trigger.value ||
                    target.closest("button") !== null
                ) {
                    return;
                }
                event.preventDefault();
                if (context.disabled()) {
                    return;
                }
                context.trigger.value?.focus();
                if (context.openOnInputClick() && !context.open.value) {
                    context.setOpen(true, "input-press", event);
                }
            };
            return () => {
                const open = context.open.value;
                const disabled = context.disabled();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, disabled },
                    {
                        role: "group",
                        "data-primitives-part": "autocomplete-input-group",
                        ...stateAttributes({ "popup-open": open, disabled }),
                        onMousedown,
                        ref: setInputGroup,
                    },
                );
            };
        },
    }),
);
