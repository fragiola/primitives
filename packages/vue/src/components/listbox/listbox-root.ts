import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    applySelection,
    createListModel,
    type ListModel,
    listKeyTarget,
    listPressSelection,
    pageTarget,
    type SelectionBehavior,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    computed,
    defineComponent,
    h,
    type PropType,
    provide,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type ListboxItemEntry, ListboxKey } from "./listbox-context.ts";

export interface ListboxRootState {
    multiple: boolean;
    disabled: boolean;
    orientation: "horizontal" | "vertical";
}

export interface ListboxRootProps {
    /** Several options can be selected. */
    multiple?: boolean;
    /** The selected value (or `null`), or the selected values with `multiple` (controlled). */
    value?: string | null | readonly string[];
    /** The value at first (default `null`, or `[]` with `multiple`). */
    defaultValue?: string | null | readonly string[];
    /** The APG's selection model (default `"toggle"`, the recommended one). */
    selectionBehavior?: SelectionBehavior;
    /** `aria-orientation`; a horizontal list moves with ArrowLeft and ArrowRight. */
    orientation?: "horizontal" | "vertical";
    /** The arrows wrap from the last option to the first and back (default `true`). */
    loopFocus?: boolean;
    /** Every option is disabled and none takes focus. */
    disabled?: boolean;
    name?: string;
    /** The form's validation fails while nothing is selected. */
    required?: boolean;
}

export type ListboxRootEmits = {
    "update:value": (value: string | null | string[]) => true;
    valueChange: (
        value: string | null | string[],
        details: ChangeDetails,
    ) => true;
};

const NONE: readonly string[] = [];

interface OrderedItem {
    element: HTMLElement;
    value: string;
    label: string | undefined;
    disabled: boolean;
}

/** The items in document order, read now. */
function inOrder(entries: readonly ListboxItemEntry[]): OrderedItem[] {
    return entries
        .map((entry) => ({
            element: entry.element,
            value: entry.value(),
            label: entry.label(),
            disabled: entry.disabled(),
        }))
        .sort((a, b) =>
            a.element.compareDocumentPosition(b.element) &
            Node.DOCUMENT_POSITION_FOLLOWING
                ? -1
                : 1,
        );
}

/** The list model of the rendered items (`@fragiola/primitives/selection`). */
function modelOf(items: readonly OrderedItem[]): ListModel {
    return createListModel(
        items.map((item) => ({
            key: item.value,
            textValue: item.label ?? item.element.textContent ?? "",
            disabled: item.disabled,
        })),
    );
}

/**
 * A list of options for choosing one value or several (`v-model:value`; spec/listbox.md, the APG
 * listbox): the `listbox`, its roving focus, the selection models, typeahead, and the hidden form
 * inputs.
 */
export const ListboxRoot: PartComponent<
    ListboxRootProps,
    ListboxRootState,
    ListboxRootEmits
> = publicComponent(
    defineComponent({
        name: "ListboxRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
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
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "vertical",
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
            const active = shallowRef<HTMLElement | null>(null);
            const within = shallowRef(false);
            const validation = shallowRef<HTMLInputElement | null>(null);
            let anchor: string | null = null;
            const typeahead = createTypeahead();

            const tabStopOf = (current: readonly string[]) => {
                const items = inOrder(entries.value);
                if (items.length === 0) {
                    return null;
                }
                if (within.value && active.value !== null) {
                    const focused = items.find(
                        (item) => item.element === active.value,
                    );
                    if (focused !== undefined) {
                        return focused.element;
                    }
                }
                return (
                    items.find((item) => current.includes(item.value))
                        ?.element ??
                    items[0]?.element ??
                    null
                );
            };
            const tabStopElement = () => tabStopOf(selected.value);

            // inside a Field, the list is the field's control (spec/listbox.md, "Forms"), as
            // RadioGroup
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
                    modelOf(inOrder(entries.value)),
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
                const items = inOrder(entries.value);
                const index = items.findIndex(
                    (item) => item.element === event.target,
                );
                const root = element.value;
                if (index === -1 || root === null) {
                    return;
                }
                const model = modelOf(items);
                const elements = items.map((item) => item.element);
                const result = listKeyTarget(event, model, index, {
                    orientation: props.orientation,
                    rtl: getDirection(root, direction()) === "rtl",
                    loop: props.loopFocus,
                    mode: mode(),
                    behavior: props.selectionBehavior,
                    page: (from, delta) =>
                        pageTarget(
                            elements,
                            from,
                            delta,
                            root,
                            props.orientation,
                        ),
                    typeahead: (character, from) =>
                        typeahead.match(character, model.labels, from),
                });
                if (result === null) {
                    return;
                }
                event.preventDefault();
                elements[result.index]?.focus();
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
                active.value = item;
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
                disabled() ? null : tabStopOf(selected.value),
            );
            const highlighted = computed(() =>
                within.value && !disabled() ? active.value : null,
            );
            provide(ListboxKey, {
                multiple: () => props.multiple,
                disabled,
                orientation: () => props.orientation,
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
                const { multiple, orientation, required } = props;
                const values = selected.value;
                const fieldName = field.name() ?? props.name;
                const state = {
                    multiple,
                    disabled: isDisabled,
                    orientation,
                };
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
                        ...field.aria(),
                        "data-primitives-part": "listbox-root",
                        ...field.attributes(),
                        ...stateAttributes({
                            multiple,
                            disabled: isDisabled,
                            orientation,
                        }),
                        onKeydown,
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () => [
                        slots.default?.({ state }),
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
