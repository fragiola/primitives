import {
    currentYearMonth,
    monthIndex,
    UNIT_PAGE_SIZE,
    unitPageStart,
} from "@fragiola/primitives/month-year";
import { computed, inject, shallowRef, useId, watch } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { MonthCalendarBindingKey } from "./month-calendar-binding-context.ts";
import type {
    MonthCalendarCellState,
    MonthCalendarComponent,
    MonthCalendarContext,
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
    disabled?: boolean;
    readOnly?: boolean;
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
    onChange: (value: MonthCalendarValue, details: ChangeDetails) => void,
) {
    const injected = inject(MonthCalendarBindingKey, null);
    // bound while it sits in a picker or view of its kind and mode with no value of its own
    const binding = computed(() =>
        injected !== null &&
        injected.kind === kind &&
        injected.mode === mode &&
        props.value === undefined &&
        props.defaultValue === undefined
            ? injected
            : null,
    );
    const option = <K extends keyof MonthCalendarOptions>(
        key: K,
    ): MonthCalendarOptions[K] =>
        props[key] !== undefined ? props[key] : binding.value?.options()[key];
    const own = useControllable<MonthCalendarValue, ChangeDetails>(
        () => props.value,
        props.defaultValue ?? null,
        onChange,
    );
    const value = computed<MonthCalendarValue>(() => {
        const bound = binding.value;
        return bound ? bound.value() : own.value.value;
    });
    const minIndex = () => {
        const min = option("min");
        return min == null ? null : itemIndex(kind, min);
    };
    const maxIndex = () => {
        const max = option("max");
        return max == null ? null : itemIndex(kind, max);
    };
    const locale = useDocumentLocale(() => option("locale"));
    const columns = () => Math.max(1, Math.floor(option("columns") ?? 3));
    const disabled = () => props.disabled ?? false;
    const readOnly = () => props.readOnly ?? binding.value?.readOnly() ?? false;
    const now = currentYearMonth();
    const todayIndex = kind === "month" ? monthIndex(now) : now.year;
    const isOutOfBounds = (index: number) => {
        const min = minIndex();
        const max = maxIndex();
        return (
            disabled() ||
            (min !== null && index < min) ||
            (max !== null && index > max) ||
            (binding.value?.isDisabled?.(index) ?? false)
        );
    };
    const clamp = (index: number) => {
        const min = minIndex();
        const max = maxIndex();
        return min !== null && index < min
            ? min
            : max !== null && index > max
              ? max
              : index;
    };
    const seed = () => {
        const current = value.value;
        const own =
            current === null
                ? null
                : isItemRange(current)
                  ? itemIndex(kind, current.start)
                  : itemIndex(kind, current);
        return clamp(own ?? binding.value?.focus?.() ?? todayIndex);
    };
    const focused = shallowRef(seed());
    const pageStart = shallowRef(unitPageStart(focused.value));
    const anchor = shallowRef<number | null>(null);
    const hovered = shallowRef<number | null>(null);
    const baseId = useId();
    const isUnavailable = (index: number) =>
        option("isUnavailable")?.(itemOf(kind, index)) ?? false;
    const commit = (next: MonthCalendarValue) => {
        const picker = binding.value;
        if (picker) {
            picker.choose(next);
        } else {
            own.set(next, { reason: "item-press" });
        }
    };
    // a picker's calendar stays mounted while its popup's exit animation runs: closing cancels a
    // started range, and reopening starts again from the value, as a fresh calendar would
    const opened = () => binding.value?.open() ?? false;
    watch(
        () => (binding.value === null ? null : binding.value.open()),
        (open) => {
            if (open === null) {
                return;
            }
            anchor.value = null;
            hovered.value = null;
            if (open) {
                const start = seed();
                focused.value = start;
                pageStart.value = unitPageStart(start);
            }
        },
        { flush: "sync" },
    );
    const range = () => {
        const current = value.value;
        return isItemRange(current)
            ? {
                  start: itemIndex(kind, current.start),
                  end: itemIndex(kind, current.end),
              }
            : null;
    };
    const focusPending = {
        current:
            (binding.value?.focusOnMount() ?? false) &&
            (binding.value?.open() ?? false),
    };

    const context: MonthCalendarContext = {
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
        cellState(index): MonthCalendarCellState {
            const span = range();
            const inRange =
                span !== null && index >= span.start && index <= span.end;
            const current = value.value;
            const single =
                current === null || isItemRange(current)
                    ? null
                    : itemIndex(kind, current);
            const previewTo = hovered.value ?? focused.value;
            const start = anchor.value;
            return {
                today: index === todayIndex,
                selected:
                    binding.value?.isSelected?.(index) ??
                    (mode === "single" ? single === index : inRange),
                disabled: isOutOfBounds(index),
                unavailable: isUnavailable(index),
                focused: index === focused.value,
                rangeStart: span !== null && index === span.start,
                rangeEnd: span !== null && index === span.end,
                inRange,
                rangePreview:
                    start !== null &&
                    index >= Math.min(start, previewTo) &&
                    index <= Math.max(start, previewTo),
            };
        },
        moveFocus(index) {
            if (isOutOfBounds(index)) {
                return false;
            }
            hovered.value = null;
            focused.value = index;
            pageStart.value = unitPageStart(index);
            return true;
        },
        canPage(delta) {
            const start = pageStart.value + delta * UNIT_PAGE_SIZE;
            for (let index = start; index < start + UNIT_PAGE_SIZE; index++) {
                if (!isOutOfBounds(index)) {
                    return true;
                }
            }
            return false;
        },
        page(delta) {
            if (!context.canPage(delta)) {
                return;
            }
            const start = pageStart.value + delta * UNIT_PAGE_SIZE;
            const target = focused.value + delta * UNIT_PAGE_SIZE;
            // the same place on the new page, else its enabled item nearest to it
            let next = target;
            for (let distance = 0; distance < UNIT_PAGE_SIZE; distance++) {
                const found = [target - distance, target + distance].find(
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
            pageStart.value = start;
            focused.value = next;
        },
        select(index) {
            if (isOutOfBounds(index) || isUnavailable(index) || readOnly()) {
                return;
            }
            focused.value = index;
            if (mode === "single") {
                commit(itemOf(kind, index));
                return;
            }
            const start = anchor.value;
            if (start === null) {
                anchor.value = index;
                return;
            }
            const [low, high] =
                start <= index ? [start, index] : [index, start];
            anchor.value = null;
            hovered.value = null;
            commit({ start: itemOf(kind, low), end: itemOf(kind, high) });
        },
        anchor,
        cancelRange() {
            anchor.value = null;
            hovered.value = null;
        },
        setHovered(index) {
            hovered.value = index;
        },
        cells: new Map(),
        requestFocus() {
            // a calendar inside a closing picker takes no focus: the picker returns it to its
            // trigger
            const picker = binding.value;
            if (picker === null || picker.open()) {
                focusPending.current = true;
            }
        },
        focusPending,
    };
    return { context, bound: binding, opened };
}
