import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    createListModel,
    type ListModel,
    listKeyTarget,
    rowTarget,
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
import { useColorPickerBinding } from "../../composables/use-color-picker-binding.ts";
import { useControllable } from "../../composables/use-controllable.ts";
import {
    OUTSIDE_FIELD,
    useFieldControl,
} from "../../composables/use-field-control.ts";
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
import {
    type ColorSwatchPickerItemEntry,
    ColorSwatchPickerKey,
} from "./color-swatch-picker-context.ts";

export interface ColorSwatchPickerRootState {
    /** The selected color, or `null`. */
    value: Color | null;
    disabled: boolean;
}

export interface ColorSwatchPickerRootProps {
    value?: Color | string | null;
    defaultValue?: Color | string | null;
    /** Every option is disabled and none takes focus. */
    disabled?: boolean;
    name?: string;
}

export type ColorSwatchPickerRootEmits = {
    "update:value": (value: Color | null) => true;
    valueChange: (value: Color | null, details: ChangeDetails) => true;
};

const COLOR_OR_NULL = [Object, String, null] as PropType<Color | string | null>;

/** A `Color`, a string `parseColor` reads (`null` when it reads none), or `null`. */
function toColor(
    value: Color | string | null | undefined,
): Color | null | undefined {
    if (value === undefined || value === null) {
        return value;
    }
    return parseColor(value);
}

interface OrderedItem {
    element: HTMLElement;
    key: string;
    color: Color;
    disabled: boolean;
}

/** The items in document order, read now. */
function inOrder(
    entries: readonly ColorSwatchPickerItemEntry[],
): OrderedItem[] {
    return entries
        .map((entry) => ({
            element: entry.element,
            key: entry.key(),
            color: entry.color(),
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
            key: item.key,
            textValue: "",
            disabled: item.disabled,
        })),
    );
}

/**
 * A palette of swatches for choosing one color (`v-model:value`; spec/color-swatch-picker.md, the
 * APG listbox in single selection): its roving focus, the arrows along and between its rows, its
 * hidden input.
 */
export const ColorSwatchPickerRoot: PartComponent<
    ColorSwatchPickerRootProps,
    ColorSwatchPickerRootState,
    ColorSwatchPickerRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorSwatchPickerRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: COLOR_OR_NULL, default: undefined },
            defaultValue: { type: COLOR_OR_NULL, default: undefined },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: Color | null) => true,
            valueChange: (_value: Color | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const report = (next: Color | null, details: ChangeDetails) => {
                emit("update:value", next);
                emit("valueChange", next, details);
            };
            const defaultValue = () => toColor(props.defaultValue) ?? null;
            // inside a ColorPicker, bound to its color unless given its own (spec/color-picker.md)
            const state = useColorPickerBinding(
                () =>
                    props.value !== undefined ||
                    props.defaultValue !== undefined,
                useControllable<Color | null, ChangeDetails>(
                    () => toColor(props.value),
                    defaultValue(),
                    report,
                ),
                report,
            );
            const { picker, bound } = state;
            const selected = computed(() =>
                state.value.value === null
                    ? null
                    : formatColor(state.value.value, "hexa"),
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const direction = useProvidedDirection();
            const entries = shallowRef<readonly ColorSwatchPickerItemEntry[]>(
                [],
            );
            const active = shallowRef<HTMLElement | null>(null);
            const within = shallowRef(false);
            const hidden = shallowRef<HTMLInputElement | null>(null);

            const tabStopOf = (current: string | null) => {
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
                    items.find((item) => item.key === current)?.element ??
                    items[0]?.element ??
                    null
                );
            };
            const tabStopElement = () => tabStopOf(selected.value);

            // in a Field, the list is the field's control (spec/color-swatch-picker.md)
            // inside a ColorPicker, the picker is the field's control: the control reads none
            const field =
                picker !== null
                    ? OUTSIDE_FIELD
                    : useFieldControl({
                          id: () => undefined,
                          labelable: false,
                          value: () => state.value.value,
                          filled: () => state.value.value !== null,
                          input: () => hidden.value,
                          element: () => element.value,
                          focusTarget: tabStopElement,
                      });
            const disabled = () =>
                props.disabled ||
                field.disabled() ||
                (picker?.disabled() ?? false);

            const choose = (
                key: string,
                reason: ChangeReason,
                event?: Event,
            ) => {
                const item = inOrder(entries.value).find(
                    (candidate) => candidate.key === key,
                );
                if (
                    item === undefined ||
                    item.disabled ||
                    key === selected.value
                ) {
                    return;
                }
                const details = { reason, event };
                state.set(item.color, details);
                bound()?.commit(item.color, details);
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
                const elements = items.map((item) => item.element);
                if (
                    (event.key === "ArrowDown" || event.key === "ArrowUp") &&
                    !event.altKey
                ) {
                    event.preventDefault();
                    const target = rowTarget(
                        elements,
                        index,
                        event.key === "ArrowDown" ? 1 : -1,
                    );
                    elements[target]?.focus();
                    return;
                }
                const result = listKeyTarget(event, modelOf(items), index, {
                    orientation: "horizontal",
                    rtl: getDirection(root, direction()) === "rtl",
                    loop: true,
                    mode: "single",
                    behavior: "toggle",
                });
                if (result === null) {
                    return;
                }
                event.preventDefault();
                elements[result.index]?.focus();
                if (result.selection?.type === "replace") {
                    choose(result.selection.key, "keyboard", event);
                }
            };

            const register = (entry: ColorSwatchPickerItemEntry) => {
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
                choose(entry.key(), "item-press", event);
            };

            // a form reset returns an uncontrolled picker to its default
            watch(
                hidden,
                (input, _, onCleanup) => {
                    if (input === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(input, {
                            reset: () => {
                                // a bound picker is reset by its ColorPicker
                                if (bound() !== null) {
                                    return;
                                }
                                field.reset();
                                state.set(defaultValue(), { reason: "none" });
                                // Vue sets `value` as a property only: the browser's reset
                                // emptied it, and an unchanged value patches nothing
                                const value = state.value.value;
                                input.value =
                                    value === null
                                        ? ""
                                        : formatColor(value, "hex");
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
            provide(ColorSwatchPickerKey, {
                disabled,
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
                    field.onBlur();
                }
            };
            const setHidden = (node: unknown) => {
                hidden.value = node as HTMLInputElement | null;
            };
            return () => {
                const isDisabled = disabled();
                const value = state.value.value;
                const current = { value, disabled: isDisabled };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        role: "listbox",
                        "aria-orientation": "horizontal",
                        "aria-disabled": isDisabled ? "true" : undefined,
                        ...field.aria(),
                        "data-primitives-part": "color-swatch-picker-root",
                        ...field.attributes(),
                        ...stateAttributes({ disabled: isDisabled }),
                        onKeydown,
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () => [
                        slots.default?.({ state: current }),
                        h("input", {
                            ref: setHidden,
                            type: "hidden",
                            name:
                                bound() === null
                                    ? (field.name() ?? props.name)
                                    : undefined,
                            value:
                                value === null ? "" : formatColor(value, "hex"),
                            disabled: isDisabled,
                            "data-primitives-part": "color-swatch-picker-input",
                        }),
                    ],
                );
            };
        },
    }),
);
