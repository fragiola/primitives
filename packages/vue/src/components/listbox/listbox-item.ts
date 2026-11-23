import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    provide,
    shallowRef,
    useId,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ListboxItemKey,
    type ListboxItemState,
    ListboxKey,
} from "./listbox-context.ts";

export interface ListboxItemProps {
    /** The value it selects. */
    value: string;
    /** Takes focus, never the selection. */
    disabled?: boolean;
    /** The text typeahead matches (default: its text content). */
    label?: string;
}

/** An `option`, focusable with a roving `tabindex` (spec/listbox.md). */
export const ListboxItem: PartComponent<ListboxItemProps, ListboxItemState> =
    publicComponent(
        defineComponent({
            name: "ListboxItem",
            inheritAttrs: false,
            props: {
                ...asProp,
                value: { type: String, required: true },
                disabled: { type: Boolean, default: false },
                label: { type: String, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(ListboxKey, "Listbox.Item");
                const element = shallowRef<HTMLElement | null>(null);
                const setElement = elementSetter(element);
                const id = useId();
                let unregister: (() => void) | null = null;
                onMounted(() => {
                    const node = element.value;
                    if (node !== null) {
                        unregister = context.register({
                            element: node,
                            value: () => props.value,
                            label: () => props.label,
                            disabled: () => props.disabled,
                        });
                    }
                });
                onBeforeUnmount(() => {
                    unregister?.();
                    unregister = null;
                });
                const state = computed<ListboxItemState>(() => ({
                    selected: context.selected.value.includes(props.value),
                    highlighted:
                        element.value !== null &&
                        context.highlighted.value === element.value,
                    disabled: props.disabled || context.disabled(),
                }));
                provide(ListboxItemKey, state);
                return () => {
                    const { selected, highlighted, disabled } = state.value;
                    const node = element.value;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state.value,
                        {
                            role: "option",
                            id,
                            // a disabled list's options take no focus at all
                            tabindex: context.disabled()
                                ? undefined
                                : node !== null &&
                                    context.tabStop.value === node
                                  ? 0
                                  : -1,
                            "aria-selected": selected ? "true" : "false",
                            "aria-disabled": disabled ? "true" : undefined,
                            "data-primitives-part": "listbox-item",
                            ...stateAttributes({
                                selected,
                                highlighted,
                                disabled,
                            }),
                            onFocus: () => {
                                if (element.value !== null) {
                                    context.focused(element.value);
                                }
                            },
                            // a Shift press selects a range, not the page's text
                            onMousedown: (event: MouseEvent) => {
                                if (event.shiftKey) {
                                    event.preventDefault();
                                }
                            },
                            onClick: (event: MouseEvent) => {
                                if (element.value !== null) {
                                    context.press(element.value, event);
                                }
                            },
                            ref: setElement,
                        },
                    );
                };
            },
        }),
    );
