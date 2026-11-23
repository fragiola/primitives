import {
    addMonths,
    clampDate,
    compareDates,
    type DateRange,
    endOfMonth,
    firstDayOfWeek,
    isBetween,
    isSameDate,
    isSameMonth,
    isWithinBounds,
    monthsBetween,
    type PlainDate,
    startOfMonth,
    today,
    watchDocumentLanguage,
} from "@fragiola/primitives/date";
import {
    type ComputedRef,
    computed,
    inject,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type {
    CalendarCellState,
    CalendarComponent,
    CalendarContext,
} from "./calendar-context.ts";
import {
    type CalendarMode,
    type CalendarOptions,
    type CalendarValue,
    isRange,
} from "./calendar-value.ts";
import {
    type PickerBinding,
    PickerBindingKey,
} from "./picker-binding-context.ts";

export interface CalendarStateProps extends CalendarOptions {
    value?: CalendarValue;
    defaultValue?: CalendarValue;
    disabled?: boolean;
    readOnly?: boolean;
}

/** The locale of the first render with no `locale`: a server knows neither of the others. */
const FIRST_RENDER_LOCALE = "en-US";

/**
 * The document's `lang`, then the browser's language (spec/calendar.md, "API"), read once the
 * calendar is mounted: a server render has neither, so the first render (the server's, and the
 * browser's hydration of it) uses `en-US` (Epic #22).
 */
function documentLocale(): string {
    if (typeof document !== "undefined" && document.documentElement.lang) {
        return document.documentElement.lang;
    }
    return typeof navigator !== "undefined"
        ? navigator.language
        : FIRST_RENDER_LOCALE;
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
    onChange: (value: CalendarValue, details: ChangeDetails) => void,
): {
    context: CalendarContext;
    /** The picker it is bound to, if any (reactive: it follows the props). */
    bound: ComputedRef<PickerBinding | null>;
    /** Bound to a picker whose popup is open. */
    opened: () => boolean;
} {
    const injected = inject(PickerBindingKey, null);
    // bound while it sits in a picker of its mode with no value of its own: decided from the
    // current props, not once at setup (a calendar given a `value` later stops being bound)
    const binding = computed(() =>
        injected !== null &&
        injected.mode === mode &&
        props.value === undefined &&
        props.defaultValue === undefined
            ? injected
            : null,
    );
    const option = <K extends keyof CalendarOptions>(
        key: K,
    ): CalendarOptions[K] =>
        props[key] !== undefined ? props[key] : binding.value?.options()[key];
    const own = useControllable<CalendarValue, ChangeDetails>(
        () => props.value,
        props.defaultValue ?? null,
        onChange,
    );
    const value = computed<CalendarValue>(() => {
        const picker = binding.value;
        return picker ? picker.value.value : own.value.value;
    });
    const min = () => option("min") ?? null;
    const max = () => option("max") ?? null;
    const mountedLocale = shallowRef<string>();
    let stopLanguage = () => {};
    onMounted(() => {
        const next = documentLocale();
        // another first weekday remakes the rows: a picker's calendar that took the focus as it
        // opened takes it again in its new cells
        if (
            next !== FIRST_RENDER_LOCALE &&
            option("locale") === undefined &&
            binding.value?.open()
        ) {
            focusPending.current = true;
        }
        mountedLocale.value = next;
        // a change of the document's `lang` is followed while mounted (Epic #49)
        stopLanguage = watchDocumentLanguage(document, () => {
            mountedLocale.value = documentLocale();
        });
    });
    onBeforeUnmount(() => stopLanguage());
    const locale = () =>
        option("locale") ?? mountedLocale.value ?? FIRST_RENDER_LOCALE;
    const firstDay = () => option("firstDayOfWeek") ?? firstDayOfWeek(locale());
    const visibleMonths = () => Math.max(1, option("visibleMonths") ?? 1);
    const todayDate = today();
    const initial = value.value;
    const initialFocus = clampDate(
        (isRange(initial) ? initial.start : initial) ?? todayDate,
        min(),
        max(),
    );
    const focusedDate = shallowRef(initialFocus);
    const visibleStart = shallowRef(startOfMonth(initialFocus));
    const anchor = shallowRef<PlainDate | null>(null);
    const hovered = shallowRef<PlainDate | null>(null);
    // a calendar in a picker focuses its focused date when it opens (spec/calendar.md, "Focus")
    const focusPending = { current: binding.value !== null };
    const baseId = useId();

    // its own, else a read-only picker's (spec/calendar.md, "Forms")
    const readOnly = () =>
        props.readOnly ?? binding.value?.readOnly?.() ?? false;
    const isOutOfBounds = (date: PlainDate) =>
        (props.disabled ?? false) || !isWithinBounds(date, min(), max());
    const commit = (next: CalendarValue) => {
        const picker = binding.value;
        if (picker) {
            picker.choose(next);
        } else {
            own.set(next, { reason: "item-press" });
        }
    };
    // a picker's calendar stays mounted while its popup's exit animation runs: closing cancels a
    // started range, and reopening starts again from the value, as a fresh calendar would
    watch(
        () => binding.value?.open() ?? null,
        (open) => {
            if (open === null) {
                return;
            }
            anchor.value = null;
            hovered.value = null;
            if (open) {
                const current = value.value;
                const start = clampDate(
                    (isRange(current) ? current.start : current) ?? todayDate,
                    min(),
                    max(),
                );
                focusedDate.value = start;
                visibleStart.value = startOfMonth(start);
            }
        },
        { flush: "sync" },
    );
    const rangeValue = (): DateRange | null =>
        isRange(value.value) ? value.value : null;

    const context: CalendarContext = {
        component,
        mode,
        locale,
        firstDay,
        visibleMonths,
        visibleStart,
        focusedDate,
        disabled: () => props.disabled ?? false,
        readOnly: () => readOnly(),
        headingId: (offset) => `${baseId}-heading-${offset}`,
        gridId: (offset) => `${baseId}-grid-${offset}`,
        cellState(date, month): CalendarCellState {
            const outsideMonth = !isSameMonth(date, month);
            const range = rangeValue();
            const inRange =
                range !== null && isBetween(date, range.start, range.end);
            const current = value.value;
            const selected =
                mode === "single"
                    ? !isRange(current) && isSameDate(current, date)
                    : inRange;
            const previewTo = hovered.value ?? focusedDate.value;
            return {
                today: isSameDate(date, todayDate),
                selected,
                disabled: isOutOfBounds(date),
                unavailable: option("isDateUnavailable")?.(date) ?? false,
                outsideMonth,
                focused: !outsideMonth && isSameDate(date, focusedDate.value),
                rangeStart: range !== null && isSameDate(date, range.start),
                rangeEnd: range !== null && isSameDate(date, range.end),
                inRange,
                rangePreview:
                    anchor.value !== null &&
                    isBetween(date, anchor.value, previewTo),
            };
        },
        moveFocus(date) {
            if (isOutOfBounds(date)) {
                return false;
            }
            // the keyboard previews the range from now on, not the last hovered date
            hovered.value = null;
            focusedDate.value = date;
            const offset = monthsBetween(visibleStart.value, date);
            if (offset < 0) {
                visibleStart.value = startOfMonth(date);
            } else if (offset >= visibleMonths()) {
                visibleStart.value = addMonths(
                    startOfMonth(date),
                    -(visibleMonths() - 1),
                );
            }
            return true;
        },
        canPage(delta) {
            const start = addMonths(
                visibleStart.value,
                delta * visibleMonths(),
            );
            const end = endOfMonth(addMonths(start, visibleMonths() - 1));
            const upper = max();
            const lower = min();
            return (
                (upper === null || compareDates(start, upper) <= 0) &&
                (lower === null || compareDates(end, lower) >= 0)
            );
        },
        page(delta) {
            if (!context.canPage(delta)) {
                return;
            }
            visibleStart.value = addMonths(
                visibleStart.value,
                delta * visibleMonths(),
            );
            focusedDate.value = clampDate(
                addMonths(focusedDate.value, delta * visibleMonths()),
                min(),
                max(),
            );
        },
        select(date) {
            if (
                isOutOfBounds(date) ||
                option("isDateUnavailable")?.(date) ||
                readOnly()
            ) {
                return;
            }
            focusedDate.value = date;
            if (mode === "single") {
                commit(date);
                return;
            }
            if (anchor.value === null) {
                anchor.value = date;
                return;
            }
            const [start, end] =
                compareDates(anchor.value, date) <= 0
                    ? [anchor.value, date]
                    : [date, anchor.value];
            anchor.value = null;
            hovered.value = null;
            commit({ start, end });
        },
        anchor,
        cancelRange() {
            anchor.value = null;
            hovered.value = null;
        },
        setHovered(date) {
            hovered.value = date;
        },
        cells: new Map(),
        rangeValue,
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
    return {
        context,
        bound: binding,
        opened: () => binding.value?.open() ?? false,
    };
}
