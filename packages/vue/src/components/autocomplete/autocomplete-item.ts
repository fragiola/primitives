import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { computed, defineComponent, shallowRef, useId, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteKey } from "./autocomplete-context.ts";

export interface AutocompleteItemState {
    highlighted: boolean;
    disabled: boolean;
}

export interface AutocompleteItemProps {
    /** The suggestion: its `itemToStringValue` becomes the value when chosen. */
    value: unknown;
    /** Can be highlighted, never chosen. */
    disabled?: boolean;
}

/** An `option`: a suggestion, never selected (spec/autocomplete.md). */
export const AutocompleteItem: PartComponent<
    AutocompleteItemProps,
    AutocompleteItemState
> = publicComponent(
    defineComponent({
        name: "AutocompleteItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** The suggestion: its `itemToStringValue` becomes the value when chosen. */
            value: { type: null, required: true },
            /** Can be highlighted, never chosen. */
            disabled: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.Item",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const id = useId();
            const { items, itemCount } = context;
            watch(
                () => [element.value, props.value, props.disabled] as const,
                ([node, value, disabled], _, onCleanup) => {
                    if (node === null) {
                        return;
                    }
                    items.set(node, { value, disabled, id });
                    itemCount.value = items.size;
                    onCleanup(() => {
                        items.delete(node);
                        itemCount.value = items.size;
                    });
                },
                { flush: "post", immediate: true },
            );
            const state = computed(() => ({
                highlighted: context.highlighted.value === id,
                disabled: props.disabled,
            }));
            watch(
                () =>
                    [
                        state.value.highlighted,
                        element.value,
                        context.positioner.value,
                    ] as const,
                ([highlighted]) => {
                    // within the popup only: a list that mounts before it is placed never
                    // scrolls the page
                    if (highlighted && element.value) {
                        scrollIntoViewWithin(
                            element.value,
                            context.positioner.value,
                        );
                    }
                },
                { flush: "post", immediate: true },
            );
            return () => {
                const { highlighted, disabled } = state.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        role: "option",
                        id,
                        "aria-disabled": disabled ? "true" : undefined,
                        "data-primitives-part": "autocomplete-item",
                        ...stateAttributes({ highlighted, disabled }),
                        onPointermove: () => {
                            if (!state.value.highlighted) {
                                context.highlight(id, "pointer");
                            }
                        },
                        // the input keeps DOM focus
                        onPointerdown: (event: PointerEvent) =>
                            event.preventDefault(),
                        onClick: (event: MouseEvent) => {
                            if (!props.disabled) {
                                context.choose(props.value, event);
                            }
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
