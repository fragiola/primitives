import {
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { MonthCalendarBindingContext } from "./month-calendar-binding-context.ts";
import type {
    MonthCalendarCellState,
    MonthCalendarComponent,
    MonthCalendarContextValue,
} from "./month-calendar-context.ts";
import {
    isItemRange,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarOptions,
    type MonthCalendarValue,
    unitsOf,
} from "./month-calendar-value.ts";
import { useDocumentLocale } from "./use-document-locale.ts";

export interface MonthCalendarStateProps extends MonthCalendarOptions {
    value?: MonthCalendarValue;
    defaultValue?: MonthCalendarValue;
    onValueChange?: (value: MonthCalendarValue, details: ChangeDetails) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

/** The options a bound calendar sets itself (they win over its picker's). */
function definedOptions(props: MonthCalendarOptions): MonthCalendarOptions {
    return Object.fromEntries(
        Object.entries({
            min: props.min,
            max: props.max,
            isUnavailable: props.isUnavailable,
            locale: props.locale,
            columns: props.columns,
            calendar: props.calendar,
        }).filter(([, value]) => value !== undefined),
    );
}

/**
 * The state of a month or year calendar, single or range (spec/month-calendar.md): the focused
 * item and its page, the value (its own, or its picker's or view's when it sits in one with no
 * value of its own), and the range being chosen. Items are numbers (`units.index`).
 */
export function useMonthCalendar(
    component: MonthCalendarComponent,
    kind: MonthCalendarKind,
    mode: MonthCalendarMode,
    props: MonthCalendarStateProps,
) {
    const binding = useContext(MonthCalendarBindingContext);
    const bound =
        binding !== null &&
        binding.kind === kind &&
        binding.mode === mode &&
        props.value === undefined &&
        props.defaultValue === undefined;
    const options: MonthCalendarOptions = bound
        ? { ...binding.options, ...definedOptions(props) }
        : props;
    const [ownValue, setOwnValue] = useControllableState<
        MonthCalendarValue,
        ChangeDetails
    >(props.value, props.defaultValue ?? null, props.onValueChange);
    const value = bound ? binding.value : ownValue;
    // a calendar system's months or years (spec/calendar-systems.md), else the ISO calendar's
    const system = options.calendar;
    const units = useMemo(() => unitsOf(kind, system), [kind, system]);
    const toIndex = (item: MonthCalendarValue) =>
        item === null || isItemRange(item) ? null : units.index(item);
    const min = options.min == null ? null : units.index(options.min);
    const max = options.max == null ? null : units.index(options.max);
    const locale = useDocumentLocale(options.locale);
    const columns = Math.max(1, Math.floor(options.columns ?? 3));
    const disabled = props.disabled ?? false;
    const readOnly = props.readOnly ?? (bound && binding.readOnly);
    const isDisabledByView = bound ? binding.isDisabled : undefined;
    const [todayIndex] = useState(units.today);
    const isOutOfBounds = useCallback(
        (index: number) =>
            disabled ||
            (min !== null && index < min) ||
            (max !== null && index > max) ||
            (isDisabledByView?.(index) ?? false),
        [disabled, min, max, isDisabledByView],
    );
    const clamp = (index: number) =>
        min !== null && index < min
            ? min
            : max !== null && index > max
              ? max
              : index;
    const seed = () =>
        clamp(
            (isItemRange(value) ? units.index(value.start) : toIndex(value)) ??
                (bound ? binding.focus : undefined) ??
                todayIndex,
        );
    const [focused, setFocused] = useState(seed);
    const [pageStart, setPageStart] = useState(() => units.pageStart(focused));
    const [anchor, setAnchor] = useState<number | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const cells = useMemo(() => new Map<number, HTMLElement>(), []);
    const baseId = useId();
    const isUnavailable = (index: number) =>
        options.isUnavailable?.(units.item(index)) ?? false;

    const moveFocus = useCallback(
        (index: number) => {
            if (isOutOfBounds(index)) {
                return false;
            }
            setHovered(null);
            setFocused(index);
            setPageStart(units.pageStart(index));
            return true;
        },
        [isOutOfBounds, units],
    );
    const canPage = useCallback(
        (delta: 1 | -1) => {
            // the next or previous page (a system's year can have 13 months)
            const start = units.page(pageStart, delta);
            const end = start + units.pageSize(start);
            for (let index = start; index < end; index++) {
                if (!isOutOfBounds(index)) {
                    return true;
                }
            }
            return false;
        },
        [pageStart, isOutOfBounds, units],
    );
    const page = useCallback(
        (delta: 1 | -1) => {
            if (!canPage(delta)) {
                return;
            }
            const start = units.page(pageStart, delta);
            const size = units.pageSize(start);
            const target = start + Math.min(focused - pageStart, size - 1);
            // the same place on the new page, else its enabled item nearest to it
            let next = target;
            for (let distance = 0; distance < size; distance++) {
                const candidates = [target - distance, target + distance];
                const found = candidates.find(
                    (index) =>
                        index >= start &&
                        index < start + size &&
                        !isOutOfBounds(index),
                );
                if (found !== undefined) {
                    next = found;
                    break;
                }
            }
            setPageStart(start);
            setFocused(next);
        },
        [canPage, pageStart, focused, isOutOfBounds, units],
    );

    const commit = (next: MonthCalendarValue) => {
        if (bound) {
            binding.choose(next);
        } else {
            setOwnValue(next, { reason: "item-press" });
        }
    };
    const select = (index: number) => {
        if (isOutOfBounds(index) || isUnavailable(index) || readOnly) {
            return;
        }
        setFocused(index);
        if (mode === "single") {
            commit(units.item(index));
            return;
        }
        if (anchor === null) {
            setAnchor(index);
            return;
        }
        const [start, end] =
            anchor <= index ? [anchor, index] : [index, anchor];
        setAnchor(null);
        setHovered(null);
        commit({ start: units.item(start), end: units.item(end) });
    };

    // a picker's calendar stays mounted while its popup's exit animation runs: closing cancels a
    // started range, and reopening starts again from the value, as a fresh calendar would
    const opened = bound && binding.open;
    const wasOpened = useRef(opened);
    const [reopened, setReopened] = useState(0);
    useLayoutEffect(() => {
        if (wasOpened.current === opened) {
            return;
        }
        wasOpened.current = opened;
        setAnchor(null);
        setHovered(null);
        if (opened) {
            const start = seed();
            setFocused(start);
            setPageStart(units.pageStart(start));
            setReopened((count) => count + 1);
        }
    });

    const range = isItemRange(value)
        ? {
              start: units.index(value.start),
              end: units.index(value.end),
          }
        : null;
    const single = toIndex(value);
    const previewTo = hovered ?? focused;
    const isSelectedByView = bound ? binding.isSelected : undefined;
    const cellState = (index: number): MonthCalendarCellState => {
        const inRange =
            range !== null && index >= range.start && index <= range.end;
        return {
            today: index === todayIndex,
            selected:
                isSelectedByView?.(index) ??
                (mode === "single" ? single === index : inRange),
            disabled: isOutOfBounds(index),
            unavailable: isUnavailable(index),
            focused: index === focused,
            rangeStart: range !== null && index === range.start,
            rangeEnd: range !== null && index === range.end,
            inRange,
            rangePreview:
                anchor !== null &&
                index >= Math.min(anchor, previewTo) &&
                index <= Math.max(anchor, previewTo),
        };
    };

    const context: Omit<
        MonthCalendarContextValue,
        "requestFocus" | "focusPending" | "focusReady"
    > = {
        component,
        kind,
        mode,
        locale,
        columns,
        pageStart,
        focused,
        disabled,
        readOnly,
        headingId: `${baseId}-heading`,
        gridId: `${baseId}-grid`,
        units,
        itemOf: units.item,
        cellState,
        moveFocus,
        page,
        canPage,
        select,
        anchor,
        cancelRange: () => {
            setAnchor(null);
            setHovered(null);
        },
        setHovered,
        cells,
    };
    return {
        context,
        bound,
        /** Takes the focus when it mounts (a picker opening, a view switched to). */
        focusOnMount: bound && binding.focusOnMount && binding.open,
        opened,
        reopened,
        /** A bound calendar takes the focus once its picker's popup is a layer. */
        focusReady: !bound || binding.layered,
    };
}
