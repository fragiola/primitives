import {
    clampDate,
    compareDates,
    type DateRange,
    firstDayOfWeek,
    isBetween,
    isSameDate,
    isWithinBounds,
    type PlainDate,
    today,
    toIsoDate,
    watchDocumentLanguage,
} from "@fragiola/primitives/date";
import {
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type {
    CalendarCellState,
    CalendarComponent,
    CalendarContextValue,
} from "./calendar-context.ts";
import {
    type CalendarMode,
    type CalendarOptions,
    type CalendarValue,
    ISO_MATH,
    isRange,
} from "./calendar-value.ts";
import { PickerBindingContext } from "./picker-binding-context.ts";

export interface CalendarStateProps extends CalendarOptions {
    value?: CalendarValue;
    defaultValue?: CalendarValue;
    onValueChange?: (value: CalendarValue, details: ChangeDetails) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

/** The locale of the first render with no `locale`: a server knows neither of the others. */
const FIRST_RENDER_LOCALE = "en-US";
const serverLocale = () => FIRST_RENDER_LOCALE;
// a change of the document's `lang` renders again (Epic #49: followed after mount)
const subscribeLanguage = (change: () => void) =>
    watchDocumentLanguage(document, change);

/**
 * The document's `lang`, then the browser's language (spec/calendar.md, "API"). A server render
 * has neither, so it, and the browser's hydration of it, use `en-US`; React renders again with
 * the document's right after a hydration (Epic #22).
 */
function documentLocale(): string {
    if (typeof document !== "undefined" && document.documentElement.lang) {
        return document.documentElement.lang;
    }
    return typeof navigator !== "undefined"
        ? navigator.language
        : FIRST_RENDER_LOCALE;
}

/** The options a bound calendar sets itself (they win over its picker's). */
function definedOptions(props: CalendarOptions): CalendarOptions {
    return Object.fromEntries(
        Object.entries({
            min: props.min,
            max: props.max,
            isDateUnavailable: props.isDateUnavailable,
            locale: props.locale,
            firstDayOfWeek: props.firstDayOfWeek,
            visibleMonths: props.visibleMonths,
            calendar: props.calendar,
        }).filter(([, value]) => value !== undefined),
    );
}

/**
 * The state of a Calendar or RangeCalendar (spec/calendar.md): the focused date and the visible
 * months, the value (its own, or its picker's when it sits in one with no value of its own), and
 * the range being chosen.
 */
export function useCalendar(
    component: CalendarComponent,
    mode: CalendarMode,
    props: CalendarStateProps,
) {
    const picker = useContext(PickerBindingContext);
    const bound =
        picker !== null &&
        picker.mode === mode &&
        props.value === undefined &&
        props.defaultValue === undefined;
    const options: CalendarOptions = bound
        ? { ...picker.options, ...definedOptions(props) }
        : props;
    const [ownValue, setOwnValue] = useControllableState<
        CalendarValue,
        ChangeDetails
    >(props.value, props.defaultValue ?? null, props.onValueChange);
    const value = bound ? picker.value : ownValue;
    const min = options.min ?? null;
    const max = options.max ?? null;
    // the server's snapshot while rendering on a server and hydrating, the document's otherwise:
    // a page rendered in the browser alone reads it at once, with no second render
    const defaultLocale = useSyncExternalStore(
        subscribeLanguage,
        documentLocale,
        serverLocale,
    );
    const locale = options.locale ?? defaultLocale;
    const firstDay = options.firstDayOfWeek ?? firstDayOfWeek(locale);
    // a calendar system's month math and names (spec/calendar-systems.md), else the ISO calendar's
    const system = options.calendar;
    const math = system ?? ISO_MATH;
    const visibleMonths = Math.max(1, options.visibleMonths ?? 1);
    const disabled = props.disabled ?? false;
    const readOnly = props.readOnly ?? (bound && picker.readOnly);
    const [todayDate] = useState(() => today());
    const [focusedDate, setFocusedDate] = useState(() =>
        clampDate(
            (isRange(value) ? value.start : value) ?? todayDate,
            min,
            max,
        ),
    );
    const [visibleStart, setVisibleStart] = useState(() =>
        math.startOfMonth(focusedDate),
    );
    const [anchor, setAnchor] = useState<PlainDate | null>(null);
    const [hovered, setHovered] = useState<PlainDate | null>(null);
    const cells = useMemo(() => new Map<string, HTMLElement>(), []);
    const baseId = useId();

    const isOutOfBounds = useCallback(
        (date: PlainDate) => disabled || !isWithinBounds(date, min, max),
        [disabled, min, max],
    );
    const isUnavailable = options.isDateUnavailable;

    const moveFocus = useCallback(
        (date: PlainDate) => {
            if (isOutOfBounds(date)) {
                return false;
            }
            // the keyboard previews the range from now on, not the last hovered date
            setHovered(null);
            setFocusedDate(date);
            setVisibleStart((start) => {
                const offset = math.monthsBetween(start, date);
                if (offset < 0) {
                    return math.startOfMonth(date);
                }
                if (offset >= visibleMonths) {
                    return math.addMonths(
                        math.startOfMonth(date),
                        -(visibleMonths - 1),
                    );
                }
                return start;
            });
            return true;
        },
        [isOutOfBounds, visibleMonths, math],
    );

    const canPage = useCallback(
        (delta: 1 | -1) => {
            const start = math.addMonths(visibleStart, delta * visibleMonths);
            const end = math.endOfMonth(
                math.addMonths(start, visibleMonths - 1),
            );
            return (
                (max === null || compareDates(start, max) <= 0) &&
                (min === null || compareDates(end, min) >= 0)
            );
        },
        [visibleStart, visibleMonths, min, max, math],
    );
    const page = useCallback(
        (delta: 1 | -1) => {
            if (!canPage(delta)) {
                return;
            }
            setVisibleStart((start) =>
                math.addMonths(start, delta * visibleMonths),
            );
            setFocusedDate((date) =>
                clampDate(
                    math.addMonths(date, delta * visibleMonths),
                    min,
                    max,
                ),
            );
        },
        [canPage, visibleMonths, min, max, math],
    );

    const commit = useCallback(
        (next: CalendarValue) => {
            if (bound) {
                picker.choose(next);
            } else {
                setOwnValue(next, { reason: "item-press" });
            }
        },
        [bound, picker, setOwnValue],
    );

    const select = useCallback(
        (date: PlainDate) => {
            if (isOutOfBounds(date) || isUnavailable?.(date) || readOnly) {
                return;
            }
            setFocusedDate(date);
            if (mode === "single") {
                commit(date);
                return;
            }
            if (anchor === null) {
                setAnchor(date);
                return;
            }
            const [start, end] =
                compareDates(anchor, date) <= 0
                    ? [anchor, date]
                    : [date, anchor];
            setAnchor(null);
            setHovered(null);
            commit({ start, end });
        },
        [isOutOfBounds, isUnavailable, readOnly, mode, anchor, commit],
    );

    // a picker's calendar stays mounted while its popup's exit animation runs: closing cancels a
    // started range, and reopening starts again from the value, as a fresh calendar would
    const opened = bound && picker.open;
    const wasOpened = useRef(opened);
    // counts the reopenings: the root asks for the focus once the reseeded date has rendered
    const [reopened, setReopened] = useState(0);
    useLayoutEffect(() => {
        if (wasOpened.current === opened) {
            return;
        }
        wasOpened.current = opened;
        setAnchor(null);
        setHovered(null);
        if (opened) {
            const start = clampDate(
                (isRange(value) ? value.start : value) ?? todayDate,
                min,
                max,
            );
            setFocusedDate(start);
            setVisibleStart(math.startOfMonth(start));
            setReopened((count) => count + 1);
        }
    }, [opened, value, todayDate, min, max, math]);

    const rangeValue: DateRange | null = isRange(value) ? value : null;
    const previewTo = hovered ?? focusedDate;
    const cellState = useCallback(
        (date: PlainDate, month: PlainDate): CalendarCellState => {
            const outsideMonth = !math.isSameMonth(date, month);
            const inRange =
                rangeValue !== null &&
                isBetween(date, rangeValue.start, rangeValue.end);
            const selected =
                mode === "single"
                    ? !isRange(value) && isSameDate(value, date)
                    : inRange;
            return {
                today: isSameDate(date, todayDate),
                selected,
                disabled: isOutOfBounds(date),
                unavailable: isUnavailable?.(date) ?? false,
                outsideMonth,
                focused: !outsideMonth && isSameDate(date, focusedDate),
                rangeStart:
                    rangeValue !== null && isSameDate(date, rangeValue.start),
                rangeEnd:
                    rangeValue !== null && isSameDate(date, rangeValue.end),
                inRange,
                rangePreview:
                    anchor !== null && isBetween(date, anchor, previewTo),
            };
        },
        [
            rangeValue,
            mode,
            value,
            todayDate,
            isOutOfBounds,
            isUnavailable,
            focusedDate,
            anchor,
            previewTo,
            math,
        ],
    );

    const cancelRange = useCallback(() => {
        setAnchor(null);
        setHovered(null);
    }, []);
    const context: Omit<
        CalendarContextValue,
        "requestFocus" | "focusPending" | "focusReady"
    > = {
        component,
        mode,
        // with a system, `Intl` writes its names (`-u-ca-`)
        locale: system ? system.locale(locale) : locale,
        math,
        calendar: system,
        firstDay,
        visibleMonths,
        visibleStart,
        focusedDate,
        disabled,
        readOnly,
        headingId: (offset) => `${baseId}-heading-${offset}`,
        gridId: (offset) => `${baseId}-grid-${offset}`,
        cellState,
        moveFocus,
        page,
        canPage,
        select,
        anchor,
        cancelRange,
        setHovered,
        cells,
        rangeValue,
    };
    return {
        context,
        bound,
        /** Bound to a picker whose popup is open. */
        opened,
        /** How many times its picker reopened while it stayed mounted. */
        reopened,
        /** A bound calendar takes the focus once its picker's popup is a layer. */
        focusReady: !bound || picker.layered,
        focusKey: toIsoDate(focusedDate),
    };
}
