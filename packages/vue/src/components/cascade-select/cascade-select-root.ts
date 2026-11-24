import {
    type CascadeItem,
    cascadeLevels,
    cascadePathItems,
} from "@fragiola/primitives/cascade";
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
    onBeforeUnmount,
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
    type CascadeSafeArea,
    CascadeSelectKey,
} from "./cascade-select-context.ts";

export interface CascadeSelectRootProps {
    /** The tree: an item with children is a parent, else a leaf. */
    items: readonly CascadeItem[];
    open?: boolean;
    defaultOpen?: boolean;
    /** The chosen path, from the first level down (`[]`: none). */
    value?: readonly string[];
    defaultValue?: readonly string[];
    /** A parent can be chosen too (spec/cascade-select.md, "Choosing"). */
    changeOnSelect?: boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    /** Joins the path in the hidden input (default `"/"`). */
    valueSeparator?: string;
}

export type CascadeSelectRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: readonly string[]) => true;
    valueChange: (value: readonly string[], details: ChangeDetails) => true;
};

const NONE: readonly string[] = [];

/**
 * Holds the cascading select's state (`v-model:value`, `v-model:open`); renders its hidden form
 * input (spec/cascade-select.md).
 */
export const CascadeSelectRoot: PublicComponent<
    CascadeSelectRootProps,
    ContentSlots,
    CascadeSelectRootEmits
> = publicComponent(
    defineComponent({
        name: "CascadeSelectRoot",
        props: {
            ...overlayRootProps,
            /** The tree: an item with children is a parent, else a leaf. */
            items: {
                type: Array as PropType<readonly CascadeItem[]>,
                required: true,
            },
            value: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            defaultValue: {
                type: Array as PropType<readonly string[]>,
                default: () => NONE,
            },
            /** A parent can be chosen too (spec/cascade-select.md, "Choosing"). */
            changeOnSelect: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            required: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            /** Joins the path in the hidden input (default `"/"`). */
            valueSeparator: { type: String, default: "/" },
        },
        emits: {
            ...overlayRootEmits,
            "update:value": (_value: readonly string[]) => true,
            valueChange: (_value: readonly string[], _details: ChangeDetails) =>
                true,
        },
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            // a template ref on the Root: `close()` and `unmount()` (spec/README.md, "Lifecycle")
            expose(root.actions);
            const state = useControllable<readonly string[], ChangeDetails>(
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
                filled: () => value.value.length > 0,
                input: () => input.value,
                focusTarget: () => root.trigger.value,
            });
            const disabled = () => props.disabled || field.disabled();
            const active = shallowRef<readonly string[]>(NONE);
            const peek = ref(false);
            const levels = computed(() =>
                cascadeLevels(
                    props.items,
                    peek.value ? active.value : active.value.slice(0, -1),
                ),
            );
            const safeArea: { current: CascadeSafeArea | null } = {
                current: null,
            };
            const hoverTimer: {
                current: ReturnType<typeof setTimeout> | undefined;
            } = { current: undefined };
            // an unmounted root never fires its hover timer
            onBeforeUnmount(() => clearTimeout(hoverTimer.current));
            const baseId = useId();
            const setActive = (next: readonly string[], nextPeek = false) => {
                active.value = next;
                peek.value = nextPeek;
            };
            provide(CascadeSelectKey, {
                ...root,
                field,
                items: () => props.items,
                value,
                disabled,
                required: () => props.required,
                changeOnSelect: () => props.changeOnSelect,
                active,
                peek,
                levels,
                setActive,
                openOn(next, reason, event) {
                    // the active path only when the opening happened (a canceled one did not)
                    if (root.setOpen(true, reason, event)) {
                        setActive(next);
                    }
                },
                choose(path, reason, event, keepOpen = false) {
                    const found = cascadePathItems(props.items, path);
                    if (
                        found === null ||
                        found.length === 0 ||
                        found.some((item) => item.disabled)
                    ) {
                        return;
                    }
                    state.set(path, { reason, event });
                    if (!keepOpen) {
                        root.setOpen(false, reason, event);
                    }
                },
                levelId: (depth) => `${baseId}-level-${depth}`,
                itemId: (depth, entry) =>
                    `${baseId}-item-${depth}-${(levels.value[depth] ?? []).findIndex((item) => item.value === entry)}`,
                safeArea,
                hoverTimer,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
            });
            // a closed popup drops its hover timer
            watch(root.open, (open) => {
                if (!open) {
                    clearTimeout(hoverTimer.current);
                    hoverTimer.current = undefined;
                    safeArea.current = null;
                }
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
                                element.value = props.defaultValue.join(
                                    props.valueSeparator,
                                );
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
                        value: value.value.join(props.valueSeparator),
                        required: props.required,
                        disabled: disabled(),
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "cascade-select-input",
                    }),
                ]);
        },
    }),
);
