import type { Align, Side } from "@fragiola/primitives/positioning";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import {
    type OverlayRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type {
    CalendarMode,
    CalendarOptions,
    CalendarValue,
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
    children?: ReactNode;
}

/**
 * The state of a DatePicker or a DateRangePicker (spec/calendar.md): the open state of its popup
 * and the value the calendar inside binds to. Renders no element.
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
    const options = useMemo(
        () => ({
            min,
            max,
            isDateUnavailable,
            locale,
            firstDayOfWeek,
            visibleMonths,
        }),
        [min, max, isDateUnavailable, locale, firstDayOfWeek, visibleMonths],
    );
    const { open } = root;
    const binding = useMemo(
        () => ({ mode, open, value, choose, options }),
        [mode, open, value, choose, options],
    );
    const context = useMemo(
        () => ({ ...root, component, placed, setPlaced }),
        [root, component, placed],
    );
    return (
        <DatePickerContext.Provider value={context}>
            <PickerBindingContext.Provider value={binding}>
                {children}
            </PickerBindingContext.Provider>
        </DatePickerContext.Provider>
    );
}
