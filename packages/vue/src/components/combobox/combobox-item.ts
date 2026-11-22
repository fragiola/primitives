import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import {
    computed,
    defineComponent,
    provide,
    shallowRef,
    useId,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { ComboboxItemState } from "./combobox-context.ts";
import { ComboboxItemKey, ComboboxKey } from "./combobox-context.ts";

export interface ComboboxItemProps {
    /** The item: written into the input as `itemToStringLabel(value)` when chosen. */
    value: unknown;
    /** Can be highlighted, never chosen. */
    disabled?: boolean;
}

/** An `option` (spec/combobox.md). */
export const ComboboxItem: PartComponent<ComboboxItemProps, ComboboxItemState> =
    publicComponent(
        defineComponent({
            name: "ComboboxItem",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** The item: written into the input as `itemToStringLabel(value)` when chosen. */
                value: { type: null, required: true },
                /** Can be highlighted, never chosen. */
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(
                    ComboboxKey,
                    "Combobox.Item",
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
                    selected: context.isSelected(props.value),
                    disabled: props.disabled,
                }));
                provide(ComboboxItemKey, state);
                watch(
                    () =>
                        [
                            state.value.highlighted,
                            element.value,
                            context.positioner.value,
                        ] as const,
                    ([highlighted]) => {
                        // within the popup only (a list that mounts before it is placed never
                        // scrolls the page), and on mount: an item can mount already highlighted
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
                    const { highlighted, selected, disabled } = state.value;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state.value,
                        {
                            role: "option",
                            id,
                            "aria-selected": selected ? "true" : undefined,
                            "aria-disabled": disabled ? "true" : undefined,
                            "data-primitives-part": "combobox-item",
                            ...stateAttributes({
                                highlighted,
                                selected,
                                disabled,
                            }),
                            onPointermove: () => {
                                if (!state.value.highlighted) {
                                    context.highlighted.value = id;
                                }
                            },
                            // the input keeps DOM focus
                            onPointerdown: (event: PointerEvent) =>
                                event.preventDefault(),
                            onClick: () => {
                                if (!props.disabled) {
                                    context.choose(props.value);
                                }
                            },
                            ref: setElement,
                        },
                    );
                };
            },
        }),
    );
