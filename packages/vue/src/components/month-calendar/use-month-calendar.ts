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
    disabled?: boolean;
    readOnly?: boolean;
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
    // a calendar system's months or years (spec/calendar-systems.md), else the ISO calendar's
    const system = () => option("calendar");
    const cached = computed(() => unitsOf(kind, system()));
    const units = () => cached.value;
    const minIndex = () => {
        const min = option("min");
        return min == null ? null : units().index(min);
    };
    const maxIndex = () => {
        const max = option("max");
        return max == null ? null : units().index(max);
    };
    const locale = useDocumentLocale(() => option("locale"));
    const columns = () => Math.max(1, Math.floor(option("columns") ?? 3));
    const disabled = () => props.disabled ?? false;
    const readOnly = () => props.readOnly ?? binding.value?.readOnly() ?? false;
    const todayIndex = units().today();
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
                  ? units().index(current.start)
                  : units().index(current);
        return clamp(own ?? binding.value?.focus?.() ?? todayIndex);
    };
    const focused = shallowRef(seed());
    const pageStart = shallowRef(units().pageStart(focused.value));
    const anchor = shallowRef<number | null>(null);
    const hovered = shallowRef<number | null>(null);
    const baseId = useId();
    const isUnavailable = (index: number) =>
        option("isUnavailable")?.(units().item(index)) ?? false;
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
                pageStart.value = units().pageStart(start);
            }
        },
        { flush: "sync" },
    );
    const range = () => {
        const current = value.value;
        return isItemRange(current)
            ? {
                  start: units().index(current.start),
                  end: units().index(current.end),
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
        units,
        itemOf: (index) => units().item(index),
        cellState(index): MonthCalendarCellState {
            const span = range();
            const inRange =
                span !== null && index >= span.start && index <= span.end;
            const current = value.value;
            const single =
                current === null || isItemRange(current)
                    ? null
                    : units().index(current);
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
            pageStart.value = units().pageStart(index);
            return true;
        },
        canPage(delta) {
            // the next or previous page (a system's year can have 13 months)
            const start = units().page(pageStart.value, delta);
            const end = start + units().pageSize(start);
            for (let index = start; index < end; index++) {
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
            const start = units().page(pageStart.value, delta);
            const size = units().pageSize(start);
            const target =
                start + Math.min(focused.value - pageStart.value, size - 1);
            // the same place on the new page, else its enabled item nearest to it
            let next = target;
            for (let distance = 0; distance < size; distance++) {
                const found = [target - distance, target + distance].find(
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
            pageStart.value = start;
            focused.value = next;
        },
        select(index) {
            if (isOutOfBounds(index) || isUnavailable(index) || readOnly()) {
                return;
            }
            focused.value = index;
            if (mode === "single") {
                commit(units().item(index));
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
            commit({ start: units().item(low), end: units().item(high) });
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
        // a bound calendar takes the focus once its picker's popup is a layer
        focusReady: () => binding.value?.layered() ?? true,
    };
    return { context, bound: binding, opened };
}
