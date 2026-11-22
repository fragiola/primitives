import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    computed,
    defineComponent,
    Fragment,
    h,
    type PropType,
    provide,
    ref,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import {
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    OpenChangeDetails,
} from "../../utils/change-details.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type RegisteredItem,
    type SelectItemData,
    SelectKey,
} from "./select-context.ts";

export interface SelectRootProps {
    open?: boolean;
    defaultOpen?: boolean;
    value?: string | null;
    defaultValue?: string | null;
    /**
     * Every item: the labels known while the list is closed. Without it, the Items register
     * themselves while mounted (keep the list mounted: `Portal keep-mounted`).
     */
    items?: readonly SelectItemData[];
    name?: string;
    required?: boolean;
    disabled?: boolean;
    /** spec/select.md, "Modal" (default `false`). */
    modal?: boolean;
}

export type SelectRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: string | null) => true;
    valueChange: (value: string | null, details: ChangeDetails) => true;
};

/** Holds the select's state (`v-model:value`, `v-model:open`); renders its hidden input (spec/select.md). */
export const SelectRoot: PublicComponent<
    SelectRootProps,
    ContentSlots,
    SelectRootEmits
> = publicComponent(
    defineComponent({
        name: "SelectRoot",
        props: {
            ...overlayRootProps,
            value: {
                type: String as PropType<string | null>,
                default: undefined,
            },
            defaultValue: {
                type: String as PropType<string | null>,
                default: null,
            },
            /** Every item; without it, the Items register themselves while mounted. */
            items: {
                type: Array as PropType<readonly SelectItemData[]>,
                default: undefined,
            },
            name: { type: String, default: undefined },
            required: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            /**
             * Locks the page's scroll and blocks the pointer outside while open (default `false`: the
             * APG select-only combobox is non-modal; spec/select.md, "Modal").
             */
            modal: { type: Boolean, default: false },
        },
        emits: {
            ...overlayRootEmits,
            "update:value": (_value: string | null) => true,
            valueChange: (_value: string | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            // without `items`, the Items register themselves (Base UI), in DOM order
            const registered = shallowRef<readonly RegisteredItem[]>([]);
            const registerItem = (item: RegisteredItem) => {
                registered.value = [
                    ...registered.value.filter(
                        (entry) => entry.element !== item.element,
                    ),
                    item,
                ].sort((a, b) =>
                    a.element.compareDocumentPosition(b.element) &
                    Node.DOCUMENT_POSITION_FOLLOWING
                        ? -1
                        : 1,
                );
                return () => {
                    registered.value = registered.value.filter(
                        (entry) => entry !== item,
                    );
                };
            };
            const items = (): readonly SelectItemData[] =>
                props.items ?? registered.value;
            // a template ref on the Root: `close()` and `unmount()` (spec/README.md, "Lifecycle")
            expose(root.actions);
            const state = useControllable<string | null, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = computed(() => state.value.value);
            const input = shallowRef<HTMLInputElement | null>(null);
            const field = useFieldControl({
                // the trigger's rendered id: the consumer's, else the generated one
                id: () => root.trigger.value?.id || root.triggerId,
                labelable: true,
                value: () => value.value,
                filled: () => value.value !== null,
                input: () => input.value,
                focusTarget: () => root.trigger.value,
            });
            const disabled = () => props.disabled || field.disabled();
            const highlighted = ref<string | null>(null);
            const baseId = useId();
            const listId = `${baseId}-list`;
            provide(SelectKey, {
                ...root,
                field,
                items,
                registers: () => props.items === undefined,
                registerItem,
                value,
                disabled,
                required: () => props.required,
                modal: () => props.modal,
                highlighted,
                openOn(entry, reason, event) {
                    // highlighted only when the opening happened (a canceled one did not)
                    if (root.setOpen(true, reason, event)) {
                        highlighted.value = entry;
                    }
                },
                choose(entry, reason, event) {
                    const item = items().find(
                        (candidate) => candidate.value === entry,
                    );
                    if (item === undefined || item.disabled) {
                        return;
                    }
                    state.set(entry, { reason, event });
                    root.setOpen(false, reason, event);
                },
                listId,
                itemId: (entry) =>
                    `${baseId}-item-${items().findIndex((item) => item.value === entry)}`,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
            });

            watch(
                input,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                field.reset();
                                state.set(props.defaultValue, {
                                    reason: "none",
                                });
                                element.value = props.defaultValue ?? "";
                            },
                            invalid: () => root.trigger.value,
                        }),
                    );
                },
                { flush: "post" },
            );
            return () =>
                h(Fragment, [
                    slots.default?.(),
                    h("input", {
                        ref: (element: unknown) => {
                            input.value = element as HTMLInputElement | null;
                        },
                        "aria-hidden": "true",
                        tabindex: -1,
                        name: field.name() ?? props.name,
                        value: value.value ?? "",
                        required: props.required,
                        disabled: disabled(),
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "select-input",
                    }),
                ]);
        },
    }),
);
