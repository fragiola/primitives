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
import { watchDocumentLanguage } from "@fragiola/primitives/date";
import {
    currentYearMonth,
    monthIndex,
    UNIT_PAGE_SIZE,
    unitPageStart,
} from "@fragiola/primitives/month-year";
import {
    type ChangeDetails,
    controllable,
    injectId,
} from "@fragiola/primitives-angular/internal";
import { MONTH_CALENDAR_BINDING } from "./month-calendar-binding.ts";
import {
    isItemRange,
    itemIndex,
    itemOf,
    type MonthCalendarComponent,
    type MonthCalendarItem,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarOptions,
    type MonthCalendarValue,
} from "./month-calendar-value.ts";

export interface MonthCalendarCellState {
    today: boolean;
    selected: boolean;
    disabled: boolean;
    unavailable: boolean;
    focused: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    rangePreview: boolean;
}

/** The inputs a month or year calendar root hands its state. */
export interface MonthCalendarInputs {
    value: Signal<MonthCalendarValue | undefined>;
    valueChange: Pick<OutputEmitterRef<MonthCalendarValue>, "emit">;
    defaultValue: Signal<MonthCalendarValue | undefined>;
    min: Signal<MonthCalendarItem | null | undefined>;
    max: Signal<MonthCalendarItem | null | undefined>;
    isUnavailable: Signal<((item: MonthCalendarItem) => boolean) | undefined>;
    locale: Signal<string | undefined>;
    columns: Signal<number | undefined>;
    disabled: Signal<boolean>;
    /** `undefined` when unset: a bound picker's then applies. */
    readOnly: Signal<boolean | undefined>;
}

/** The enclosing month or year calendar's state, for its parts (provided by its root). */
export const MONTH_CALENDAR = new InjectionToken<MonthCalendarState>(
    "MONTH_CALENDAR",
);

/**
 * The document's `lang`, then the browser's language; `en-US` on a server (the calendars' rule,
 * spec/calendar.md "API"). A copy of the calendar's, so its entry is unchanged.
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
 * The state of a month or year calendar, single or range (spec/month-calendar.md): the focused
 * item and its page, the value (its own, or its picker's or view's when it sits in one with no
 * value of its own), and the range being chosen. Items are numbers (`itemIndex`). Created in a
 * root directive's injection context.
 */
export class MonthCalendarState {
    private readonly binding = inject(MONTH_CALENDAR_BINDING, {
        optional: true,
    });
    /** In a picker or view of its kind and mode, with no value of its own. */
    readonly bound = computed(
        () =>
            this.binding !== null &&
            this.binding.kind() === this.kind &&
            this.binding.mode === this.mode &&
            this.inputs.value() === undefined &&
            this.inputs.defaultValue() === undefined,
    );
    private readonly own = controllable<MonthCalendarValue, ChangeDetails>(
        this.inputs.value,
        this.inputs.valueChange,
        () => this.inputs.defaultValue() ?? null,
        (value, details) => this.emit(value, details),
    );
    readonly value = computed<MonthCalendarValue>(() =>
        this.bound() && this.binding ? this.binding.value() : this.own.value(),
    );
    private readonly options = computed<MonthCalendarOptions>(() => {
        const own: MonthCalendarOptions = {
            min: this.inputs.min(),
            max: this.inputs.max(),
            isUnavailable: this.inputs.isUnavailable(),
            locale: this.inputs.locale(),
            columns: this.inputs.columns(),
        };
        if (!this.bound() || this.binding === null) {
            return own;
        }
        const merged: Record<string, unknown> = { ...this.binding.options() };
        for (const [key, value] of Object.entries(own)) {
            if (value !== undefined) {
                merged[key] = value;
            }
        }
        return merged as MonthCalendarOptions;
    });
    readonly min = computed(() => {
        const min = this.options().min;
        return min == null ? null : itemIndex(this.kind, min);
    });
    readonly max = computed(() => {
        const max = this.options().max;
        return max == null ? null : itemIndex(this.kind, max);
    });
    private readonly document = inject(DOCUMENT);
    private readonly browser = inject(PLATFORM_ID) === "browser";
    /** Bumped by a change of the document's `lang` in the browser (followed after mount). */
    private readonly language = signal(0);
    readonly locale = computed(() => {
        const own = this.options().locale;
        if (own !== undefined) {
            return own;
        }
        this.language();
        return documentLocale(this.document, this.browser);
    });
    readonly columns = computed(() =>
        Math.max(1, Math.floor(this.options().columns ?? 3)),
    );
    readonly disabled = computed(() => this.inputs.disabled());
    readonly readOnly = computed(
        () =>
            this.inputs.readOnly() ??
            (this.bound() && (this.binding?.readOnly() ?? false)),
    );
    readonly todayIndex: number;
    private seed: number | null = null;
    private readonly focusedOwn = signal<number | null>(null);
    private readonly pageOwn = signal<number | null>(null);
    /** The focused item: seeded once from the value (or the view's, or today), clamped. */
    readonly focused = computed(() => this.focusedOwn() ?? this.initialFocus());
    /** The first item of the page shown. */
    readonly pageStart = computed(
        () => this.pageOwn() ?? unitPageStart(this.initialFocus()),
    );
    /** A range calendar: the start of a range being chosen, and the item it previews to. */
    readonly anchor = signal<number | null>(null);
    readonly hovered = signal<number | null>(null);
    readonly cells = new Map<number, HTMLElement>();
    readonly baseId = injectId("primitives-month-calendar");
    /** Whether a focus is pending (`null`: not decided yet; a bound one may start with one). */
    private focusPending: boolean | null = null;

    constructor(
        /** The part attribute's prefix of its parts (`month-calendar-cell`, ...). */
        readonly component: MonthCalendarComponent,
        readonly kind: MonthCalendarKind,
        readonly mode: MonthCalendarMode,
        private readonly inputs: MonthCalendarInputs,
        private readonly emit: (
            value: MonthCalendarValue,
            details: ChangeDetails,
        ) => void,
    ) {
        const now = currentYearMonth();
        this.todayIndex = kind === "month" ? monthIndex(now) : now.year;
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
            const open = this.bound() && (this.binding?.open() ?? false);
            untracked(() => {
                if (wasOpen !== null && wasOpen !== open) {
                    this.anchor.set(null);
                    this.hovered.set(null);
                    if (open) {
                        this.seed = null;
                        this.focusedOwn.set(null);
                        this.pageOwn.set(null);
                        this.focusPending = true;
                    }
                }
                wasOpen = open;
            });
        });
    }

    private clamp(index: number): number {
        const min = this.min();
        const max = this.max();
        if (min !== null && index < min) {
            return min;
        }
        return max !== null && index > max ? max : index;
    }

    private initialFocus(): number {
        this.seed ??= untracked(() => {
            const value = this.value();
            const own =
                value === null
                    ? null
                    : itemIndex(
                          this.kind,
                          isItemRange(value) ? value.start : value,
                      );
            const view =
                this.bound() && this.binding?.focus
                    ? this.binding.focus()
                    : null;
            return this.clamp(own ?? view ?? this.todayIndex);
        });
        return this.seed;
    }

    /** The part attribute of one of its parts. */
    part(name: string): string {
        return `${this.component}-${name}`;
    }

    headingId(): string {
        return `${this.baseId}-heading`;
    }

    gridId(): string {
        return `${this.baseId}-grid`;
    }

    itemOf(index: number): MonthCalendarItem {
        return itemOf(this.kind, index);
    }

    isOutOfBounds(index: number): boolean {
        const min = this.min();
        const max = this.max();
        return (
            this.disabled() ||
            (min !== null && index < min) ||
            (max !== null && index > max) ||
            (this.bound() && (this.binding?.isDisabled?.(index) ?? false))
        );
    }

    isUnavailable(index: number): boolean {
        return (
            this.options().isUnavailable?.(itemOf(this.kind, index)) ?? false
        );
    }

    /** Moves the focused item (and the page); `false` when it is disabled. */
    moveFocus(index: number): boolean {
        if (this.isOutOfBounds(index)) {
            return false;
        }
        this.hovered.set(null);
        this.focusedOwn.set(index);
        this.pageOwn.set(unitPageStart(index));
        return true;
    }

    canPage(delta: 1 | -1): boolean {
        const start = this.pageStart() + delta * UNIT_PAGE_SIZE;
        for (let index = start; index < start + UNIT_PAGE_SIZE; index++) {
            if (!this.isOutOfBounds(index)) {
                return true;
            }
        }
        return false;
    }

    page(delta: 1 | -1): void {
        // the button keeps the focus: a focus left pending is dropped
        this.focusPending = false;
        if (!this.canPage(delta)) {
            return;
        }
        const start = this.pageStart() + delta * UNIT_PAGE_SIZE;
        const target = this.focused() + delta * UNIT_PAGE_SIZE;
        // the same place on the new page, else its enabled item nearest to it
        let next = target;
        for (let distance = 0; distance < UNIT_PAGE_SIZE; distance++) {
            const found = [target - distance, target + distance].find(
                (index) =>
                    index >= start &&
                    index < start + UNIT_PAGE_SIZE &&
                    !this.isOutOfBounds(index),
            );
            if (found !== undefined) {
                next = found;
                break;
            }
        }
        this.pageOwn.set(start);
        this.focusedOwn.set(next);
    }

    private commit(next: MonthCalendarValue): void {
        if (this.bound() && this.binding) {
            this.binding.choose(next);
        } else {
            this.own.set(next, { reason: "item-press" });
        }
    }

    select(index: number): void {
        if (
            this.isOutOfBounds(index) ||
            this.isUnavailable(index) ||
            this.readOnly()
        ) {
            return;
        }
        this.focusedOwn.set(index);
        if (this.mode === "single") {
            this.commit(itemOf(this.kind, index));
            return;
        }
        const anchor = this.anchor();
        if (anchor === null) {
            this.anchor.set(index);
            return;
        }
        const [start, end] =
            anchor <= index ? [anchor, index] : [index, anchor];
        this.anchor.set(null);
        this.hovered.set(null);
        this.commit({
            start: itemOf(this.kind, start),
            end: itemOf(this.kind, end),
        });
    }

    cancelRange(): void {
        this.anchor.set(null);
        this.hovered.set(null);
    }

    cellState(index: number): MonthCalendarCellState {
        const value = this.value();
        const range = isItemRange(value)
            ? {
                  start: itemIndex(this.kind, value.start),
                  end: itemIndex(this.kind, value.end),
              }
            : null;
        const single =
            value === null || isItemRange(value)
                ? null
                : itemIndex(this.kind, value);
        const anchor = this.anchor();
        const previewTo = this.hovered() ?? this.focused();
        const inRange =
            range !== null && index >= range.start && index <= range.end;
        const byView =
            this.bound() && this.binding?.isSelected
                ? this.binding.isSelected(index)
                : undefined;
        return {
            today: index === this.todayIndex,
            selected:
                byView ?? (this.mode === "single" ? single === index : inRange),
            disabled: this.isOutOfBounds(index),
            unavailable: this.isUnavailable(index),
            focused: index === this.focused(),
            rangeStart: range !== null && index === range.start,
            rangeEnd: range !== null && index === range.end,
            inRange,
            rangePreview:
                anchor !== null &&
                index >= Math.min(anchor, previewTo) &&
                index <= Math.max(anchor, previewTo),
        };
    }

    /** Asks for the focused item's cell to take focus once it is rendered. */
    requestFocus(): void {
        this.focusPending = true;
    }

    private applyPendingFocus(): void {
        untracked(() => {
            this.focusPending ??=
                this.bound() &&
                (this.binding?.focusOnMount() ?? false) &&
                (this.binding?.open() ?? false);
            if (!this.focusPending) {
                return;
            }
            // a calendar inside a closing picker takes no focus
            if (this.binding !== null && this.bound() && !this.binding.open()) {
                this.focusPending = false;
                return;
            }
            const cell = this.cells.get(this.focused());
            if (cell?.isConnected) {
                this.focusPending = false;
                cell.focus({ preventScroll: true });
            }
        });
    }
}
