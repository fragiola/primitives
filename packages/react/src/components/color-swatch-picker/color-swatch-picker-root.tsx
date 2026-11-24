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
    type FocusEvent,
    type KeyboardEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useColorPickerBinding } from "../../hooks/use-color-picker-binding.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSwatchPickerContext,
    type ColorSwatchPickerItemEntry,
} from "./color-swatch-picker-context.ts";

export interface ColorSwatchPickerRootState {
    /** The selected color, or `null`. */
    value: Color | null;
    disabled: boolean;
}

export interface ColorSwatchPickerRootProps
    extends PartProps<ColorSwatchPickerRootState> {
    value?: Color | string | null;
    defaultValue?: Color | string | null;
    onValueChange?: (value: Color | null, details: ChangeDetails) => void;
    /** Every option is disabled and none takes focus. */
    disabled?: boolean;
    name?: string;
}

/** A `Color`, a string `parseColor` reads (`null` when it reads none), or `null`. */
function toColor(
    value: Color | string | null | undefined,
): Color | null | undefined {
    if (value === undefined || value === null) {
        return value;
    }
    return parseColor(value);
}

/** The items in document order. */
function inOrder(
    entries: readonly ColorSwatchPickerItemEntry[],
): ColorSwatchPickerItemEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The list model of the rendered items (`@fragiola/primitives/selection`). */
function modelOf(entries: readonly ColorSwatchPickerItemEntry[]): ListModel {
    return createListModel(
        entries.map((entry) => ({
            key: entry.key,
            textValue: "",
            disabled: entry.disabled,
        })),
    );
}

/**
 * A palette of swatches for choosing one color (spec/color-swatch-picker.md, the APG listbox in
 * single selection): its roving focus, the arrows along and between its rows, its hidden input.
 */
export function ColorSwatchPickerRoot({
    value: valueProp,
    defaultValue: defaultValueProp,
    onValueChange,
    disabled: disabledProp = false,
    name,
    children,
    ...props
}: ColorSwatchPickerRootProps) {
    const defaultValue = defaultValueProp ?? null;
    // inside a ColorPicker, bound to its color unless given its own (spec/color-picker.md)
    const { picker, bound } = useColorPickerBinding(
        valueProp !== undefined || defaultValueProp !== undefined,
    );
    const [own, setOwn] = useControllableState<Color | null, ChangeDetails>(
        toColor(valueProp),
        toColor(defaultValue) ?? null,
        onValueChange,
    );
    const value = bound === null ? own : bound.value;
    const selected = value === null ? null : formatColor(value, "hexa");
    const [element, ref] = useElement<HTMLElement>();
    const direction = useContext(DirectionContext);
    const [entries, setEntries] = useState<
        readonly ColorSwatchPickerItemEntry[]
    >([]);
    const ordered = inOrder(entries);
    const [active, setActive] = useState<HTMLElement | null>(null);
    const [within, setWithin] = useState(false);
    const hidden = useRef<HTMLInputElement>(null);

    const tabStopOf = useCallback(
        (
            items: readonly ColorSwatchPickerItemEntry[],
            current: string | null,
        ) => {
            if (items.length === 0) {
                return null;
            }
            if (within && active !== null) {
                const focused = items.find((entry) => entry.element === active);
                if (focused !== undefined) {
                    return focused.element;
                }
            }
            return (
                items.find((entry) => entry.key === current)?.element ??
                items[0]?.element ??
                null
            );
        },
        [within, active],
    );
    const latest = useRef({ entries, selected, tabStopOf, bound, setOwn });
    latest.current = { entries, selected, tabStopOf, bound, setOwn };
    const tabStopElement = useCallback(() => {
        const current = latest.current;
        return current.tabStopOf(inOrder(current.entries), current.selected);
    }, []);

    // in a Field, the list is the field's control (spec/color-swatch-picker.md, "Forms and Field")
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        input: () => hidden.current,
        element: () => element,
        focusTarget: tabStopElement,
        // inside a ColorPicker, the picker is the field's control
        skip: picker !== null,
    });
    const disabled =
        disabledProp || field.disabled || (picker?.disabled ?? false);

    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const choose = useCallback(
        (key: string, reason: ChangeReason, event?: Event) => {
            const current = latest.current;
            const entry = current.entries.find(
                (candidate) => candidate.key === key,
            );
            if (
                entry === undefined ||
                entry.disabled ||
                key === current.selected
            ) {
                return;
            }
            const details = { reason, event };
            if (current.bound === null) {
                current.setOwn(entry.color, details);
                return;
            }
            onValueChangeRef.current?.(entry.color, details);
            current.bound.setValue(entry.color, details);
            current.bound.commit(entry.color, details);
        },
        [],
    );
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented) {
            return;
        }
        const items = inOrder(latest.current.entries);
        const index = items.findIndex(
            (entry) => entry.element === event.target,
        );
        if (index === -1) {
            return;
        }
        const elements = items.map((entry) => entry.element);
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
        const model = modelOf(items);
        const result = listKeyTarget(event, model, index, {
            orientation: "horizontal",
            rtl: getDirection(event.currentTarget, direction) === "rtl",
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
            choose(result.selection.key, "keyboard", event.nativeEvent);
        }
    };

    const register = useCallback((entry: ColorSwatchPickerItemEntry) => {
        setEntries((current) => [...current, entry]);
        return () =>
            setEntries((current) => current.filter((item) => item !== entry));
    }, []);
    const focused = useCallback((item: HTMLElement) => {
        setActive(item);
        setWithin(true);
    }, []);
    const press = useCallback(
        (item: HTMLElement, event: MouseEvent) => {
            const entry = latest.current.entries.find(
                (candidate) => candidate.element === item,
            );
            if (entry === undefined || disabled) {
                return;
            }
            item.focus();
            choose(entry.key, "item-press", event);
        },
        [disabled, choose],
    );

    // a form reset returns an uncontrolled picker to its default
    const reset = useRef({ defaultValue, markReset: field.reset });
    reset.current = { defaultValue, markReset: field.reset };
    useEffect(() => {
        const input = hidden.current;
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                // a bound picker is reset by its ColorPicker
                if (latest.current.bound !== null) {
                    return;
                }
                const current = reset.current;
                current.markReset();
                latest.current.setOwn(toColor(current.defaultValue) ?? null, {
                    reason: "none",
                });
            },
            invalid: tabStopElement,
        });
    }, [tabStopElement]);

    const tabStop = disabled ? null : tabStopOf(ordered, selected);
    const highlighted = within && !disabled ? active : null;
    const context = useMemo(
        () => ({
            disabled,
            selected,
            tabStop,
            highlighted,
            register,
            focused,
            press,
        }),
        [disabled, selected, tabStop, highlighted, register, focused, press],
    );
    const formName = bound === null ? (field.name ?? name) : undefined;
    return (
        <ColorSwatchPickerContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children: (
                        <>
                            {children}
                            <input
                                ref={hidden}
                                type="hidden"
                                name={formName}
                                value={
                                    value === null
                                        ? ""
                                        : formatColor(value, "hex")
                                }
                                disabled={disabled}
                                data-primitives-part="color-swatch-picker-input"
                            />
                        </>
                    ),
                },
                { value, disabled },
                {
                    role: "listbox",
                    "aria-orientation": "horizontal",
                    "aria-disabled": disabled ? "true" : undefined,
                    ...field.aria,
                    "data-primitives-part": "color-swatch-picker-root",
                    ...field.attributes,
                    ...stateAttributes({ disabled }),
                    onKeyDown,
                    onFocus: field.onFocus,
                    // the focus left the list: the next Tab in lands on the selection (APG)
                    onBlur: (event: FocusEvent<HTMLElement>) => {
                        const next = event.relatedTarget;
                        if (
                            !(next instanceof Node) ||
                            !event.currentTarget.contains(next)
                        ) {
                            setWithin(false);
                            field.onBlur();
                        }
                    },
                },
                ref,
            )}
        </ColorSwatchPickerContext.Provider>
    );
}
