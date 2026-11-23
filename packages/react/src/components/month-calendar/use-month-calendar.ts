import {
    currentYearMonth,
    monthIndex,
    UNIT_PAGE_SIZE,
    unitPageStart,
} from "@fragiola/primitives/month-year";
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
    itemIndex,
    itemOf,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarOptions,
    type MonthCalendarValue,
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
        }).filter(([, value]) => value !== undefined),
    );
}

/**
 * The state of a month or year calendar, single or range (spec/month-calendar.md): the focused
 * item and its page, the value (its own, or its picker's or view's when it sits in one with no
 * value of its own), and the range being chosen. Items are numbers (`itemIndex`).
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
    const toIndex = (item: MonthCalendarValue) =>
        item === null || isItemRange(item) ? null : itemIndex(kind, item);
    const min = options.min == null ? null : itemIndex(kind, options.min);
    const max = options.max == null ? null : itemIndex(kind, options.max);
    const locale = useDocumentLocale(options.locale);
    const columns = Math.max(1, Math.floor(options.columns ?? 3));
    const disabled = props.disabled ?? false;
    const readOnly = props.readOnly ?? (bound && binding.readOnly);
    const isDisabledByView = bound ? binding.isDisabled : undefined;
    const [todayIndex] = useState(() => {
        const now = currentYearMonth();
        return kind === "month" ? monthIndex(now) : now.year;
    });
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
            (isItemRange(value)
                ? itemIndex(kind, value.start)
                : toIndex(value)) ??
                (bound ? binding.focus : undefined) ??
                todayIndex,
        );
    const [focused, setFocused] = useState(seed);
    const [pageStart, setPageStart] = useState(() => unitPageStart(focused));
    const [anchor, setAnchor] = useState<number | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const cells = useMemo(() => new Map<number, HTMLElement>(), []);
    const baseId = useId();
    const isUnavailable = (index: number) =>
        options.isUnavailable?.(itemOf(kind, index)) ?? false;

    const moveFocus = useCallback(
        (index: number) => {
            if (isOutOfBounds(index)) {
                return false;
            }
            setHovered(null);
            setFocused(index);
            setPageStart(unitPageStart(index));
            return true;
        },
        [isOutOfBounds],
    );

    const canPage = useCallback(
        (delta: 1 | -1) => {
            const start = pageStart + delta * UNIT_PAGE_SIZE;
            for (let index = start; index < start + UNIT_PAGE_SIZE; index++) {
                if (!isOutOfBounds(index)) {
                    return true;
                }
            }
            return false;
        },
        [pageStart, isOutOfBounds],
    );
    const page = useCallback(
        (delta: 1 | -1) => {
            if (!canPage(delta)) {
                return;
            }
            const start = pageStart + delta * UNIT_PAGE_SIZE;
            const target = focused + delta * UNIT_PAGE_SIZE;
            // the same place on the new page, else its enabled item nearest to it
            let next = target;
            for (let distance = 0; distance < UNIT_PAGE_SIZE; distance++) {
                const candidates = [target - distance, target + distance];
                const found = candidates.find(
                    (index) =>
                        index >= start &&
                        index < start + UNIT_PAGE_SIZE &&
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
        [canPage, pageStart, focused, isOutOfBounds],
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
            commit(itemOf(kind, index));
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
        commit({ start: itemOf(kind, start), end: itemOf(kind, end) });
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
            setPageStart(unitPageStart(start));
            setReopened((count) => count + 1);
        }
    });

    const range = isItemRange(value)
        ? {
              start: itemIndex(kind, value.start),
              end: itemIndex(kind, value.end),
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
        "requestFocus" | "focusPending"
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
        itemOf: (index) => itemOf(kind, index),
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
    };
}
