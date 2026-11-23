import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    applySelection,
    createListModel,
    listKeyTarget,
    listPressSelection,
    type SelectionBehavior,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    computed,
    defineComponent,
    h,
    nextTick,
    type PropType,
    provide,
    shallowRef,
    type VNode,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    useVirtualRows,
    type VirtualListProps,
    virtualListProps,
} from "../../composables/use-virtual-rows.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type ListboxItemEntry,
    ListboxKey,
} from "../listbox/listbox-context.ts";
import type { ListboxRootState } from "../listbox/listbox-root.ts";

/** One option of a virtual Listbox: its value, the label typeahead matches, its disabled state. */
export interface ListboxVirtualItem {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface ListboxVirtualRootProps extends VirtualListProps {
    /** Every option, in the list's order. */
    items: readonly ListboxVirtualItem[];
    /** Several options can be selected. */
    multiple?: boolean;
    /** The selected value (or `null`), or the selected values with `multiple` (controlled). */
    value?: string | null | readonly string[];
    /** The value at first (default `null`, or `[]` with `multiple`). */
    defaultValue?: string | null | readonly string[];
    /** The APG's selection model (default `"toggle"`, the recommended one). */
    selectionBehavior?: SelectionBehavior;
    /** The arrows wrap from the last option to the first and back (default `true`). */
    loopFocus?: boolean;
    /** Every option is disabled and none takes focus. */
    disabled?: boolean;
    name?: string;
    /** The form's validation fails while nothing is selected. */
    required?: boolean;
}

export type ListboxVirtualRootEmits = {
    "update:value": (value: string | null | string[]) => true;
    valueChange: (
        value: string | null | string[],
        details: ChangeDetails,
    ) => true;
    loadMore: () => true;
};

/**
 * The default scoped slot renders a `Listbox.Item` for each item in view
 * (`v-slot="{ item, index }"`), with the item's `value` and `disabled`.
 */
export interface ListboxVirtualRootSlots {
    default?: (scope: { item: ListboxVirtualItem; index: number }) => VNode[];
    render?: (scope: RenderSlotProps<ListboxRootState>) => VNode[];
}

const NONE: readonly string[] = [];
/** A virtual list is vertical (spec/virtual-lists.md). */
const orientation = "vertical" as const;

/**
 * A Listbox Root over `items`, rendering only the options in view (spec/virtual-lists.md): the
 * keys, the typeahead, the ranges and select all run over every item, a key scrolls its target
 * into view and focuses it, and the focused option and the tab stop stay rendered.
 */
export const ListboxVirtualRoot: PublicComponent<
    ListboxVirtualRootProps & { as?: AsProp },
    ListboxVirtualRootSlots,
    ListboxVirtualRootEmits
> = publicComponent(
    defineComponent({
        name: "ListboxVirtualRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...virtualListProps,
            items: {
                type: Array as PropType<readonly ListboxVirtualItem[]>,
                required: true,
            },
            multiple: { type: Boolean, default: false },
            value: {
                type: [String, Array] as PropType<
                    string | null | readonly string[]
                >,
                default: undefined,
            },
            defaultValue: {
                type: [String, Array] as PropType<
                    string | null | readonly string[]
                >,
                default: undefined,
            },
            selectionBehavior: {
                type: String as PropType<SelectionBehavior>,
                default: "toggle",
            },
            loopFocus: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            required: { type: Boolean, default: false },
        },
        emits: {
            "update:value": (_value: string | null | string[]) => true,
            valueChange: (
                _value: string | null | string[],
                _details: ChangeDetails,
            ) => true,
            loadMore: () => true,
        },
        setup(props, { attrs, slots, emit }) {
            // read at reset time too: the form reset takes the current default (as React does)
            const defaultValue = (): unknown =>
                props.defaultValue ?? (props.multiple ? NONE : null);
            const own = useControllable<unknown, ChangeDetails>(
                () => props.value,
                defaultValue(),
                (next, details) => {
                    const reported = next as string | null | string[];
                    emit("update:value", reported);
                    emit("valueChange", reported, details);
                },
            );
            const selected = computed<readonly string[]>(() => {
                const value = own.value.value;
                if (props.multiple) {
                    return (value as readonly string[] | null) ?? NONE;
                }
                return value === null || value === undefined
                    ? NONE
                    : [value as string];
            });
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const direction = useProvidedDirection();
            const entries = shallowRef<readonly ListboxItemEntry[]>([]);
            const focusedValue = shallowRef<string | null>(null);
            const within = shallowRef(false);
            const validation = shallowRef<HTMLInputElement | null>(null);
            let anchor: string | null = null;
            const typeahead = createTypeahead();
            const indexOf = computed(
                () =>
                    new Map(
                        props.items.map((item, index) => [item.value, index]),
                    ),
            );

            // the tab stop: the focused option while the focus is inside, else the first
            // selected, else the first (APG)
            const tabStopValue = computed(() => {
                const focused = focusedValue.value;
                if (
                    within.value &&
                    focused !== null &&
                    indexOf.value.has(focused)
                ) {
                    return focused;
                }
                const chosen = new Set(selected.value);
                return (
                    props.items.find((item) => chosen.has(item.value))?.value ??
                    props.items[0]?.value ??
                    null
                );
            });
            const pinned = computed(() =>
                [tabStopValue.value, focusedValue.value].flatMap((key) =>
                    key === null ? [] : [indexOf.value.get(key) ?? -1],
                ),
            );
            const virtual = useVirtualRows({
                items: () => props.items,
                pinned: () => pinned.value,
                list: element,
                props,
                onLoadMore: () => emit("loadMore"),
            });
            const { virtualizer } = virtual;
            const elementOf = (key: string | null) =>
                key === null
                    ? null
                    : (entries.value.find((entry) => entry.value() === key)
                          ?.element ?? null);
            const tabStopElement = () => elementOf(tabStopValue.value);

            // inside a Field, the list is the field's control (spec/listbox.md, "Forms")
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => own.value.value,
                filled: () => selected.value.length > 0,
                input: () => validation.value,
                element: () => element.value,
                focusTarget: tabStopElement,
            });
            const disabled = () => props.disabled || field.disabled();
            const mode = () => (props.multiple ? "multiple" : "single");
            const model = computed(() =>
                createListModel(
                    props.items.map((item) => ({
                        key: item.value,
                        textValue: item.label,
                        disabled: item.disabled === true,
                    })),
                ),
            );

            const commit = (
                change: SelectionChange | null,
                reason: ChangeReason,
                event?: Event,
            ) => {
                if (change === null) {
                    return;
                }
                const current = selected.value;
                const next = applySelection(
                    model.value,
                    { selected: current, anchor },
                    change,
                    { mode: mode(), behavior: props.selectionBehavior },
                );
                anchor = next.anchor;
                if (sameSelection(next.selected, current)) {
                    return;
                }
                own.set(
                    props.multiple
                        ? [...next.selected]
                        : (next.selected[0] ?? null),
                    { reason, event },
                );
            };

            const onKeydown = (event: KeyboardEvent) => {
                if (disabled() || event.defaultPrevented) {
                    return;
                }
                const entry = entries.value.find(
                    (candidate) => candidate.element === event.target,
                );
                const index =
                    entry === undefined
                        ? -1
                        : (indexOf.value.get(entry.value()) ?? -1);
                const root = element.value;
                if (index === -1 || root === null) {
                    return;
                }
                const list = model.value;
                const result = listKeyTarget(event, list, index, {
                    orientation,
                    rtl: getDirection(root, direction()) === "rtl",
                    loop: props.loopFocus,
                    mode: mode(),
                    behavior: props.selectionBehavior,
                    page: (from, delta) => virtualizer.pageIndex(from, delta),
                    typeahead: (character, from) =>
                        typeahead.match(character, list.labels, from),
                });
                if (result === null) {
                    return;
                }
                event.preventDefault();
                const target = props.items[result.index];
                if (target !== undefined) {
                    // the target renders in view, then takes the focus: Vue patches the DOM in
                    // a microtask, before the next key's event
                    focusedValue.value = target.value;
                    virtualizer.scrollToIndex(result.index);
                    const targetIndex = result.index;
                    nextTick().then(() => {
                        root.querySelector<HTMLElement>(
                            `[data-index="${targetIndex}"]`,
                        )?.focus();
                    });
                }
                commit(result.selection, "keyboard", event);
            };

            const register = (entry: ListboxItemEntry) => {
                entries.value = [...entries.value, entry];
                return () => {
                    entries.value = entries.value.filter(
                        (item) => item !== entry,
                    );
                };
            };
            const focused = (item: HTMLElement) => {
                const entry = entries.value.find(
                    (candidate) => candidate.element === item,
                );
                if (entry !== undefined) {
                    focusedValue.value = entry.value();
                }
                within.value = true;
            };
            const press = (item: HTMLElement, event: MouseEvent) => {
                const entry = entries.value.find(
                    (candidate) => candidate.element === item,
                );
                if (entry === undefined || disabled()) {
                    return;
                }
                item.focus();
                commit(
                    listPressSelection(entry.value(), event, {
                        mode: mode(),
                        behavior: props.selectionBehavior,
                    }),
                    "item-press",
                    event,
                );
            };

            watch(
                validation,
                (input, _, onCleanup) => {
                    if (input === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(input, {
                            reset: () => {
                                field.reset();
                                anchor = null;
                                own.set(defaultValue(), { reason: "none" });
                            },
                            invalid: tabStopElement,
                        }),
                    );
                },
                { flush: "post" },
            );

            const tabStop = computed(() =>
                disabled() ? null : elementOf(tabStopValue.value),
            );
            const highlighted = computed(() =>
                within.value && !disabled()
                    ? elementOf(focusedValue.value)
                    : null,
            );
            provide(ListboxKey, {
                multiple: () => props.multiple,
                disabled,
                orientation: () => orientation,
                selected,
                tabStop,
                highlighted,
                register,
                focused,
                press,
            });

            const onFocusin = () => field.onFocus();
            // the focus left the list: the next Tab in lands on the selection (APG)
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget as Node | null;
                if (next === null || !element.value?.contains(next)) {
                    within.value = false;
                    typeahead.reset();
                    field.onBlur();
                }
            };
            const setValidation = (node: unknown) => {
                validation.value = node as HTMLInputElement | null;
            };
            return () => {
                const isDisabled = disabled();
                const { multiple, required, loading } = props;
                const values = selected.value;
                const fieldName = field.name() ?? props.name;
                const state = {
                    multiple,
                    disabled: isDisabled,
                    orientation,
                };
                const render = slots.default;
                const rows = virtual.rows(
                    render && ((item, index) => render({ item, index })),
                );
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        role: "listbox",
                        "aria-orientation": orientation,
                        "aria-multiselectable": multiple ? "true" : undefined,
                        "aria-required": required ? "true" : undefined,
                        "aria-disabled": isDisabled ? "true" : undefined,
                        "aria-busy": loading ? "true" : undefined,
                        ...field.aria(),
                        "data-primitives-part": "listbox-root",
                        ...field.attributes(),
                        ...stateAttributes({
                            multiple,
                            disabled: isDisabled,
                            orientation,
                            loading,
                        }),
                        onKeydown,
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () => [
                        ...rows,
                        h("input", {
                            ref: setValidation,
                            "aria-hidden": "true",
                            tabindex: -1,
                            name: multiple ? undefined : fieldName,
                            value: multiple ? "" : (values[0] ?? ""),
                            required: multiple
                                ? required && values.length === 0
                                : required,
                            disabled: isDisabled,
                            style: VISUALLY_HIDDEN_INPUT_STYLE,
                            "data-primitives-part": "listbox-input",
                        }),
                        ...(multiple && fieldName !== undefined
                            ? values.map((key) =>
                                  h("input", {
                                      key,
                                      type: "hidden",
                                      name: fieldName,
                                      value: key,
                                      disabled: isDisabled,
                                      "data-primitives-part": "listbox-input",
                                  }),
                              )
                            : []),
                    ],
                );
            };
        },
    }),
);
