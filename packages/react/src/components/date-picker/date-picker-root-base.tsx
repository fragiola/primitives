import { toIsoDate } from "@fragiola/primitives/date";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import {
    type OverlayRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type CalendarMode,
    type CalendarOptions,
    type CalendarValue,
    isRange,
} from "../calendar/calendar-value.ts";
import { PickerBindingContext } from "../calendar/picker-binding-context.ts";
import {
    type DatePickerComponent,
    DatePickerContext,
} from "./date-picker-context.ts";

/** The props both picker roots share (each adds its own typed value). */
export interface DatePickerRootSharedProps
    extends OverlayRootProps,
        CalendarOptions {
    /** The form name: the Root renders a hidden input that submits the value (ISO 8601). */
    name?: string;
    /** A form submission needs a value. */
    required?: boolean;
    /** The trigger cannot open the popup, and the value is not submitted. */
    disabled?: boolean;
    /** The value cannot change: the popup opens, its calendar is read-only. */
    readOnly?: boolean;
    children?: ReactNode;
}

const NOOP = () => {};

/**
 * What the form submits: `2026-11-24`, a range `2026-11-25/2026-11-27` (the ISO 8601 interval), or
 * empty with no value (a range is one only once both ends are chosen).
 */
function formValue(value: CalendarValue): string {
    if (value === null) {
        return "";
    }
    if (isRange(value)) {
        return `${toIsoDate(value.start)}/${toIsoDate(value.end)}`;
    }
    return toIsoDate(value);
}

/**
 * The state of a DatePicker or a DateRangePicker (spec/calendar.md): the open state of its popup,
 * the value the calendar inside binds to, and its form support. Renders no element of its own but
 * the hidden input, after its children, while it has a name.
 */
export function DatePickerRootBase({
    component,
    mode,
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    isDateUnavailable,
    locale,
    firstDayOfWeek,
    visibleMonths,
    calendar,
    name,
    required = false,
    disabled: disabledProp = false,
    readOnly = false,
    children,
    ...overlayProps
}: DatePickerRootSharedProps & {
    component: DatePickerComponent;
    mode: CalendarMode;
    value?: CalendarValue;
    defaultValue?: CalendarValue;
    onValueChange?: (value: CalendarValue, details: ChangeDetails) => void;
}): ReactNode {
    const root = useOverlayRoot(overlayProps);
    const [value, setValue] = useControllableState<
        CalendarValue,
        ChangeDetails
    >(valueProp, defaultValue ?? null, onValueChange);
    const input = useRef<HTMLInputElement>(null);
    const field = useFieldControl({
        // the trigger's rendered id: the consumer's, else the generated one
        id: root.trigger?.id || root.triggerId,
        labelable: true,
        // a click would open the popup and take the focus away: the label focuses the trigger
        labelFocuses: true,
        value,
        filled: value !== null,
        input: () => input.current,
        focusTarget: () => root.trigger,
    });
    const disabled = disabledProp || field.disabled;
    const formName = field.name ?? name;
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "start",
    });
    const { setOpen } = root;
    const choose = useCallback(
        (next: CalendarValue) => {
            setValue(next, { reason: "item-press" });
            setOpen(false, "item-press");
        },
        [setValue, setOpen],
    );

    // a form reset returns the value to its default; a failed validation focuses the trigger
    const latest = useRef({
        defaultValue,
        setValue,
        trigger: root.trigger,
        reset: field.reset,
    });
    latest.current = {
        defaultValue,
        setValue,
        trigger: root.trigger,
        reset: field.reset,
    };
    const named = formName !== undefined;
    useEffect(() => {
        const element = input.current;
        if (!named || element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const current = latest.current;
                const initial = current.defaultValue ?? null;
                current.reset();
                current.setValue(initial, { reason: "none" });
                element.value = formValue(initial);
            },
            invalid: () => latest.current.trigger,
        });
    }, [named]);

    const options = useMemo(
        () => ({
            min,
            max,
            isDateUnavailable,
            locale,
            firstDayOfWeek,
            visibleMonths,
            calendar,
        }),
        [
            min,
            max,
            isDateUnavailable,
            locale,
            firstDayOfWeek,
            visibleMonths,
            calendar,
        ],
    );
    // whether the popup is a layer: its calendar takes the focus only then (spec/calendar.md, "Focus")
    const [layered, setLayered] = useState(false);
    const { open } = root;
    const binding = useMemo(
        () => ({ mode, open, layered, value, choose, options, readOnly }),
        [mode, open, layered, value, choose, options, readOnly],
    );
    const context = useMemo(
        () => ({
            ...root,
            component,
            placed,
            setPlaced,
            setLayered,
            field,
            disabled,
            readOnly,
            required,
        }),
        [root, component, placed, field, disabled, readOnly, required],
    );
    return (
        <DatePickerContext.Provider value={context}>
            <PickerBindingContext.Provider value={binding}>
                {children}
            </PickerBindingContext.Provider>
            {formName === undefined ? null : (
                <input
                    ref={input}
                    aria-hidden="true"
                    tabIndex={-1}
                    name={formName}
                    value={formValue(value)}
                    required={required}
                    disabled={disabled}
                    onChange={NOOP}
                    style={VISUALLY_HIDDEN_INPUT_STYLE}
                    data-primitives-part={`${component}-input`}
                />
            )}
        </DatePickerContext.Provider>
    );
}
