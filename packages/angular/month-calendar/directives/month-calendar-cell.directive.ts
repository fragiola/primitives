import {
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
} from "@angular/core";
import {
    formatMonthName,
    formatYear,
    formatYearMonth,
    type PlainYearMonth,
} from "@fragiola/primitives/month-year";
import {
    dataValues,
    injectHost,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR,
    type MonthCalendarCellState,
} from "../utils/month-calendar-state.ts";
import {
    itemIndex,
    type MonthCalendarItem,
} from "../utils/month-calendar-value.ts";

/**
 * One month or year: `<td monthCalendarCell [value]="item" #cell="monthCalendarCell">{{ cell.text()
 * }}</td>`. Its name and its text come from `Intl` (the locale exception); the consumer's own
 * `aria-label` replaces the name.
 */
@Directive({
    selector: "[monthCalendarCell]",
    exportAs: "monthCalendarCell",
    host: {
        role: "gridcell",
        "[attr.data-primitives-part]": "calendar.part('cell')",
        "[attr.aria-label]": "label()",
        "[attr.tabindex]": "state().focused && !state().disabled ? 0 : -1",
        "[attr.aria-selected]": "state().selected ? 'true' : null",
        "[attr.aria-disabled]":
            "state().disabled || state().unavailable ? 'true' : null",
        "[attr.aria-current]": "state().today ? 'date' : null",
        "[attr.data-today]": "data().today",
        "[attr.data-selected]": "data().selected",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-unavailable]": "data().unavailable",
        "[attr.data-range-start]": "data()['range-start']",
        "[attr.data-range-end]": "data()['range-end']",
        "[attr.data-in-range]": "data()['in-range']",
        "[attr.data-range-preview]": "data()['range-preview']",
        "(mousedown)": "onMouseDown($event)",
        "(click)": "onClick()",
        "(pointerenter)": "onPointerEnter()",
        "(focus)": "onFocus()",
    },
})
export class MonthCalendarCell {
    protected readonly calendar = inject(MONTH_CALENDAR);
    /** The month or year. */
    readonly value = input.required<MonthCalendarItem>();
    private readonly index = computed(() =>
        itemIndex(this.calendar.kind, this.value()),
    );
    readonly state = computed<MonthCalendarCellState>(() =>
        this.calendar.cellState(this.index()),
    );
    /** The month's long name or the year, in the locale: the cell's content. */
    readonly text = computed(() =>
        this.calendar.kind === "month"
            ? formatMonthName(
                  this.calendar.locale(),
                  this.value() as PlainYearMonth,
                  "long",
              )
            : formatYear(this.calendar.locale(), this.value().year),
    );
    private readonly ownLabel = ownAttribute("aria-label");
    protected readonly label = computed(
        () =>
            this.ownLabel ??
            (this.calendar.kind === "month"
                ? formatYearMonth(
                      this.calendar.locale(),
                      this.value() as PlainYearMonth,
                  )
                : formatYear(this.calendar.locale(), this.value().year)),
    );
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            today: state.today,
            selected: state.selected,
            disabled: state.disabled,
            unavailable: state.unavailable,
            "range-start": state.rangeStart,
            "range-end": state.rangeEnd,
            "in-range": state.inRange,
            "range-preview": state.rangePreview,
        });
    });

    constructor() {
        const host = injectHost();
        const cells = this.calendar.cells;
        let key: number | null = null;
        const release = () => {
            if (key !== null && cells.get(key) === host) {
                cells.delete(key);
            }
        };
        // registered under its item; the root focuses it when a focus is pending
        effect(() => {
            release();
            key = this.index();
            cells.set(key, host);
        });
        inject(DestroyRef).onDestroy(release);
    }

    /** A disabled item never takes the focus, not even from a press. */
    protected onMouseDown(event: MouseEvent): void {
        if (this.state().disabled) {
            event.preventDefault();
        }
    }

    protected onClick(): void {
        if (!this.state().disabled) {
            this.calendar.select(this.index());
            this.calendar.requestFocus();
        }
    }

    protected onPointerEnter(): void {
        if (this.calendar.anchor() !== null) {
            this.calendar.hovered.set(this.index());
        }
    }

    protected onFocus(): void {
        if (!this.state().focused) {
            this.calendar.moveFocus(this.index());
        }
    }
}
