import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type PlainYear,
    type PlainYearMonth,
    toIsoYear,
    toIsoYearMonth,
} from "@fragiola/primitives/month-year";
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
    DatePickerContext,
    type PickerComponent,
} from "../date-picker/date-picker-context.ts";
import { MonthCalendarBindingContext } from "../month-calendar/month-calendar-binding-context.ts";
import {
    isItemRange,
    type MonthCalendarItem,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarValue,
} from "../month-calendar/month-calendar-value.ts";

/** The props every month and year picker root shares (each adds its own typed value). */
export interface MonthPickerRootSharedProps extends OverlayRootProps {
    /** A BCP 47 tag, passed to the bound calendar. */
    locale?: string;
    /** Items per row, passed to the bound calendar (default 3). */
    columns?: number;
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

/** `2026-11` or `2026`. */
function isoOf(kind: MonthCalendarKind, item: MonthCalendarItem): string {
    return kind === "month"
        ? toIsoYearMonth(item as PlainYearMonth)
        : toIsoYear(item as PlainYear);
}

/**
 * What the form submits: `2026-11`, `2026`, a range as the ISO 8601 interval (`2026-03/2026-06`,
 * `2020/2024`), or empty with no value.
 */
function formValue(kind: MonthCalendarKind, value: MonthCalendarValue): string {
    if (value === null) {
        return "";
    }
    if (isItemRange(value)) {
        return `${isoOf(kind, value.start)}/${isoOf(kind, value.end)}`;
    }
    return isoOf(kind, value);
}

/**
 * The state of a MonthPicker, MonthRangePicker, YearPicker or YearRangePicker
 * (spec/month-calendar.md): the DatePicker's (the open state of its popup, its form support, its
 * Field), with a month or year value the calendar inside binds to. It provides the DatePicker's
 * context, so the DatePicker's Trigger, Portal, Positioner and Popup are its parts.
 */
export function MonthPickerRootBase({
    component,
    kind,
    mode,
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    isUnavailable,
    locale,
    columns,
    name,
    required = false,
    disabled: disabledProp = false,
    readOnly = false,
    children,
    ...overlayProps
}: MonthPickerRootSharedProps & {
    component: PickerComponent;
    kind: MonthCalendarKind;
    mode: MonthCalendarMode;
    value?: MonthCalendarValue;
    defaultValue?: MonthCalendarValue;
    onValueChange?: (value: MonthCalendarValue, details: ChangeDetails) => void;
    min?: MonthCalendarItem | null;
    max?: MonthCalendarItem | null;
    isUnavailable?(item: MonthCalendarItem): boolean;
}): ReactNode {
    const root = useOverlayRoot(overlayProps);
    const [value, setValue] = useControllableState<
        MonthCalendarValue,
        ChangeDetails
    >(valueProp, defaultValue ?? null, onValueChange);
    const input = useRef<HTMLInputElement>(null);
    const field = useFieldControl({
        id: root.trigger?.id || root.triggerId,
        labelable: true,
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
        (next: MonthCalendarValue) => {
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
                element.value = formValue(kind, initial);
            },
            invalid: () => latest.current.trigger,
        });
    }, [named, kind]);

    const options = useMemo(
        () => ({ min, max, isUnavailable, locale, columns }),
        [min, max, isUnavailable, locale, columns],
    );
    const { open } = root;
    const binding = useMemo(
        () => ({
            kind,
            mode,
            open,
            focusOnMount: true,
            value,
            choose,
            options,
            readOnly,
        }),
        [kind, mode, open, value, choose, options, readOnly],
    );
    const context = useMemo(
        () => ({
            ...root,
            component,
            placed,
            setPlaced,
            field,
            disabled,
            readOnly,
            required,
        }),
        [root, component, placed, field, disabled, readOnly, required],
    );
    return (
        <DatePickerContext.Provider value={context}>
            <MonthCalendarBindingContext.Provider value={binding}>
                {children}
            </MonthCalendarBindingContext.Provider>
            {formName === undefined ? null : (
                <input
                    ref={input}
                    aria-hidden="true"
                    tabIndex={-1}
                    name={formName}
                    value={formValue(kind, value)}
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
