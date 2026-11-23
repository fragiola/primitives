import {
    afterEveryRender,
    computed,
    DestroyRef,
    DOCUMENT,
    effect,
    InjectionToken,
    inject,
    type OutputEmitterRef,
    PLATFORM_ID,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
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
    type ChangeDetails,
    controllable,
    injectId,
} from "@fragiola/primitives-angular/internal";
import {
    type CalendarComponent,
    type CalendarMath,
    type CalendarMode,
    type CalendarOptions,
    type CalendarValue,
    ISO_MATH,
    isRange,
} from "./calendar-value.ts";
import { PICKER_BINDING } from "./picker-binding.ts";

export interface CalendarCellState {
    today: boolean;
    selected: boolean;
    disabled: boolean;
    unavailable: boolean;
    outsideMonth: boolean;
    focused: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    rangePreview: boolean;
}

/** The inputs a Calendar or RangeCalendar root hands its state (spec/calendar.md). */
export interface CalendarInputs {
    value: Signal<CalendarValue | undefined>;
    valueChange: Pick<OutputEmitterRef<CalendarValue>, "emit">;
    defaultValue: Signal<CalendarValue | undefined>;
    min: Signal<PlainDate | null | undefined>;
    max: Signal<PlainDate | null | undefined>;
    isDateUnavailable: Signal<((date: PlainDate) => boolean) | undefined>;
    locale: Signal<string | undefined>;
    firstDayOfWeek: Signal<number | undefined>;
    visibleMonths: Signal<number | undefined>;
    /** A calendar system (spec/calendar-systems.md); `undefined`: the ISO calendar. */
    calendar: Signal<CalendarSystem | undefined>;
    disabled: Signal<boolean>;
    /** `undefined` when unset: a bound picker's then applies. */
    readOnly: Signal<boolean | undefined>;
}

/** The enclosing calendar's state, for its parts (provided by both roots). */
export const CALENDAR = new InjectionToken<CalendarState>("CALENDAR");

/**
 * The document's `lang`, then the browser's language (spec/calendar.md, "API"). A server render
 * has a document (Angular's) but no browser: there it falls back to `en-US`, never the server's
 * own language (Epic #22); hydration then writes the browser's text.
 */
function documentLocale(doc: Document, browser: boolean): string {
    if (doc.documentElement.lang) {
        return doc.documentElement.lang;
    }
    return browser && typeof navigator !== "undefined"
        ? navigator.language
        : "en-US";
}

/**
 * The state of a Calendar or RangeCalendar (spec/calendar.md): the focused date and the visible
 * months, the value (its own, or its picker's when it sits in one with no value of its own), and
 * the range being chosen. Created in a root directive's injection context.
 */
export class CalendarState {
    private readonly picker = inject(PICKER_BINDING, { optional: true });
    /** In a picker of the same mode, with no value of its own: the picker's value and options. */
    readonly bound = computed(
        () =>
            this.picker !== null &&
            this.picker.mode === this.mode &&
            this.inputs.value() === undefined &&
            this.inputs.defaultValue() === undefined,
    );
    private readonly own = controllable<CalendarValue, ChangeDetails>(
        this.inputs.value,
        this.inputs.valueChange,
        () => this.inputs.defaultValue() ?? null,
        (value, details) => this.emit(value, details),
    );
    readonly value = computed<CalendarValue>(() =>
        this.bound() && this.picker ? this.picker.value() : this.own.value(),
    );
    private readonly options = computed<CalendarOptions>(() => {
        const own: CalendarOptions = {
            min: this.inputs.min(),
            max: this.inputs.max(),
            isDateUnavailable: this.inputs.isDateUnavailable(),
            locale: this.inputs.locale(),
            firstDayOfWeek: this.inputs.firstDayOfWeek(),
            visibleMonths: this.inputs.visibleMonths(),
            calendar: this.inputs.calendar(),
        };
        if (!this.bound() || this.picker === null) {
            return own;
        }
        const merged: Record<string, unknown> = { ...this.picker.options() };
        for (const [key, value] of Object.entries(own)) {
            if (value !== undefined) {
                merged[key] = value;
            }
        }
        return merged as CalendarOptions;
    });
    readonly min = computed(() => this.options().min ?? null);
    readonly max = computed(() => this.options().max ?? null);
    private readonly document = inject(DOCUMENT);
    // `"browser"` or `"server"` (`isPlatformBrowser` lives in @angular/common, not a peer)
    private readonly browser = inject(PLATFORM_ID) === "browser";
    /** Bumped by a change of the document's `lang` in the browser (Epic #49: followed after mount). */
    private readonly language = signal(0);
    private readonly baseLocale = computed(() => {
        const own = this.options().locale;
        if (own !== undefined) {
            return own;
        }
        this.language();
        return documentLocale(this.document, this.browser);
    });
    /** The calendar system, when one is given (a CalendarView's month and year views use it). */
    readonly system = (): CalendarSystem | undefined => this.options().calendar;
    /** The month math: the calendar system's (its hook), or the ISO calendar's. */
    readonly math = (): CalendarMath => this.system() ?? ISO_MATH;
    /** The locale `Intl` writes the names in (with a calendar system's `-u-ca-`). */
    readonly locale = computed(
        () => this.system()?.locale(this.baseLocale()) ?? this.baseLocale(),
    );
    readonly firstDay = computed(
        () =>
            this.options().firstDayOfWeek ?? firstDayOfWeek(this.baseLocale()),
    );
    readonly visibleMonths = computed(() =>
        Math.max(1, this.options().visibleMonths ?? 1),
    );
    readonly disabled = computed(() => this.inputs.disabled());
    /** Its own `readOnly` when set (an explicit `false` included), else its bound picker's. */
    readonly readOnly = computed(
        () =>
            this.inputs.readOnly() ??
            (this.bound() && (this.picker?.readOnly() ?? false)),
    );
    readonly todayDate = today();
    private seed: PlainDate | null = null;
    private readonly focusedOwn = signal<PlainDate | null>(null);
    private readonly visibleOwn = signal<PlainDate | null>(null);
    /** The focused date: seeded once from the value (or today), clamped to the bounds. */
    readonly focusedDate = computed(
        () => this.focusedOwn() ?? this.initialFocus(),
    );
    /** The first visible month (day 1). */
    readonly visibleStart = computed(
        () =>
            this.visibleOwn() ?? this.math().startOfMonth(this.initialFocus()),
    );
    /** RangeCalendar: the start of a range being chosen, and the date it previews to. */
    readonly anchor = signal<PlainDate | null>(null);
    readonly hovered = signal<PlainDate | null>(null);
    readonly rangeValue = computed<DateRange | null>(() => {
        const value = this.value();
        return isRange(value) ? value : null;
    });
    readonly cells = new Map<string, HTMLElement>();
    readonly baseId = injectId("primitives-calendar");
    /** Whether a focus is pending (`null`: not decided yet; a calendar in a picker starts with one). */
    private focusPending: boolean | null = null;

    constructor(
        /** The part attribute's prefix of its parts (`calendar-cell`, `range-calendar-cell`). */
        readonly component: CalendarComponent,
        readonly mode: CalendarMode,
        private readonly inputs: CalendarInputs,
        private readonly emit: (
            value: CalendarValue,
            details: ChangeDetails,
        ) => void,
    ) {
        // after every render while a focus is pending: the focused date's cell may mount later
        // than the keyboard moved to it (a new month, a picker opening; AGENTS.md "Porting", 5)
        afterEveryRender(() => this.applyPendingFocus());
        if (this.browser) {
            const stop = watchDocumentLanguage(this.document, () =>
                this.language.update((count) => count + 1),
            );
            inject(DestroyRef).onDestroy(stop);
        }
        // a picker's calendar stays mounted while its popup's exit animation runs: closing cancels
        // a started range, and reopening starts again from the value, as a fresh calendar would
        let wasOpen: boolean | null = null;
        effect(() => {
            const open = this.bound() && (this.picker?.open() ?? false);
            untracked(() => {
                if (wasOpen !== null && wasOpen !== open) {
                    this.anchor.set(null);
                    this.hovered.set(null);
                    if (open) {
                        this.seed = null;
                        this.focusedOwn.set(null);
                        this.visibleOwn.set(null);
                        this.focusPending = true;
                    }
                }
                wasOpen = open;
            });
        });
    }

    private initialFocus(): PlainDate {
        this.seed ??= untracked(() => {
            const value = this.value();
            return clampDate(
                (isRange(value) ? value.start : value) ?? this.todayDate,
                this.min(),
                this.max(),
            );
        });
        return this.seed;
    }

    /** The part attribute of one of its parts. */
    part(name: string): string {
        return `${this.component}-${name}`;
    }

    headingId(offset: number): string {
        return `${this.baseId}-heading-${offset}`;
    }

    gridId(offset: number): string {
        return `${this.baseId}-grid-${offset}`;
    }

    isOutOfBounds(date: PlainDate): boolean {
        return this.disabled() || !isWithinBounds(date, this.min(), this.max());
    }

    isUnavailable(date: PlainDate): boolean {
        return this.options().isDateUnavailable?.(date) ?? false;
    }

    /** Moves the focused date (and the visible months); `false` when it is out of bounds. */
    moveFocus(date: PlainDate): boolean {
        if (this.isOutOfBounds(date)) {
            return false;
        }
        const math = this.math();
        const visibleMonths = this.visibleMonths();
        const start = this.visibleStart();
        const offset = math.monthsBetween(start, date);
        // the keyboard previews the range from now on, not the last hovered date
        this.hovered.set(null);
        this.focusedOwn.set(date);
        if (offset < 0) {
            this.visibleOwn.set(math.startOfMonth(date));
        } else if (offset >= visibleMonths) {
            this.visibleOwn.set(
                math.addMonths(math.startOfMonth(date), -(visibleMonths - 1)),
            );
        } else {
            this.visibleOwn.set(start);
        }
        return true;
    }

    canPage(delta: 1 | -1): boolean {
        const math = this.math();
        const visibleMonths = this.visibleMonths();
        const start = math.addMonths(
            this.visibleStart(),
            delta * visibleMonths,
        );
        const end = math.endOfMonth(math.addMonths(start, visibleMonths - 1));
        const min = this.min();
        const max = this.max();
        return (
            (max === null || compareDates(start, max) <= 0) &&
            (min === null || compareDates(end, min) >= 0)
        );
    }

    page(delta: 1 | -1): void {
        // the button keeps the focus: a focus left pending is dropped
        this.focusPending = false;
        if (!this.canPage(delta)) {
            return;
        }
        const math = this.math();
        const step = delta * this.visibleMonths();
        this.visibleOwn.set(math.addMonths(this.visibleStart(), step));
        this.focusedOwn.set(
            clampDate(
                math.addMonths(this.focusedDate(), step),
                this.min(),
                this.max(),
            ),
        );
    }

    private commit(next: CalendarValue): void {
        if (this.bound() && this.picker) {
            this.picker.choose(next);
        } else {
            this.own.set(next, { reason: "item-press" });
        }
    }

    select(date: PlainDate): void {
        if (
            this.isOutOfBounds(date) ||
            this.isUnavailable(date) ||
            this.readOnly()
        ) {
            return;
        }
        this.focusedOwn.set(date);
        if (this.mode === "single") {
            this.commit(date);
            return;
        }
        const anchor = this.anchor();
        if (anchor === null) {
            this.anchor.set(date);
            return;
        }
        const [start, end] =
            compareDates(anchor, date) <= 0 ? [anchor, date] : [date, anchor];
        this.anchor.set(null);
        this.hovered.set(null);
        this.commit({ start, end });
    }

    cancelRange(): void {
        this.anchor.set(null);
        this.hovered.set(null);
    }

    cellState(date: PlainDate, month: PlainDate): CalendarCellState {
        const value = this.value();
        const rangeValue = this.rangeValue();
        const anchor = this.anchor();
        const outsideMonth = !this.math().isSameMonth(date, month);
        const inRange =
            rangeValue !== null &&
            isBetween(date, rangeValue.start, rangeValue.end);
        const selected =
            this.mode === "single"
                ? !isRange(value) && isSameDate(value, date)
                : inRange;
        return {
            today: isSameDate(date, this.todayDate),
            selected,
            disabled: this.isOutOfBounds(date),
            unavailable: this.isUnavailable(date),
            outsideMonth,
            focused: !outsideMonth && isSameDate(date, this.focusedDate()),
            rangeStart:
                rangeValue !== null && isSameDate(date, rangeValue.start),
            rangeEnd: rangeValue !== null && isSameDate(date, rangeValue.end),
            inRange,
            rangePreview:
                anchor !== null &&
                isBetween(date, anchor, this.hovered() ?? this.focusedDate()),
        };
    }

    /** Asks for the focused date's cell to take focus once it is rendered. */
    requestFocus(): void {
        this.focusPending = true;
    }

    private applyPendingFocus(): void {
        untracked(() => {
            this.focusPending ??= this.bound();
            if (!this.focusPending) {
                return;
            }
            // a calendar inside a closing picker takes no focus: the picker returns it to its
            // trigger
            if (this.picker !== null && this.bound() && !this.picker.open()) {
                this.focusPending = false;
                return;
            }
            const cell = this.cells.get(toIsoDate(this.focusedDate()));
            if (cell?.isConnected) {
                this.focusPending = false;
                cell.focus({ preventScroll: true });
            }
        });
    }
}
