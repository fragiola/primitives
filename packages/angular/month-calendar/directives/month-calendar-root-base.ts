import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
} from "@angular/core";
import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import { dataValues } from "@fragiola/primitives-angular/internal";
import type {
    MonthCalendarInputs,
    MonthCalendarState,
} from "../utils/month-calendar-state.ts";

const optionalNumber = (value: unknown): number | undefined =>
    value === undefined || value === null ? undefined : numberAttribute(value);

/**
 * The inputs and the root element every month and year calendar root shares
 * (spec/month-calendar.md). Each root declares its own typed value, bounds and `isUnavailable`
 * inputs and creates the state after them.
 */
@Directive({
    host: {
        "[attr.data-primitives-part]": "calendar.part('root')",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
    },
})
export abstract class MonthCalendarRootBase {
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    readonly locale = input<string | undefined>(undefined);
    /** Items per row (default 3). */
    readonly columns = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /**
     * A calendar system from `@fragiola/primitives/calendar-systems` (spec/calendar-systems.md):
     * the items are its months (a page is its year) or years, and so are the values
     * (`[calendar]`; the root's `calendar` is its state).
     */
    readonly calendarSystem = input<CalendarSystem | undefined>(undefined, {
        alias: "calendar",
    });
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Default: a bound picker's `readOnly`, else `false`; an explicit `false` wins over the picker's. */
    readonly readOnly = input<boolean | undefined, unknown>(undefined, {
        transform: (value: unknown) =>
            value === undefined ? undefined : booleanAttribute(value),
    });
    /** The root's state, for its parts and `exportAs`. */
    abstract readonly calendar: MonthCalendarState;
    protected readonly data = computed(() =>
        dataValues({
            disabled: this.disabled(),
            readonly: this.calendar.readOnly(),
        }),
    );

    /** The inputs the state reads, with the root's own typed inputs. */
    protected stateInputs(
        own: Pick<
            MonthCalendarInputs,
            | "value"
            | "valueChange"
            | "defaultValue"
            | "min"
            | "max"
            | "isUnavailable"
        >,
    ): MonthCalendarInputs {
        return {
            ...own,
            locale: this.locale,
            columns: this.columns,
            calendar: this.calendarSystem,
            disabled: this.disabled,
            readOnly: this.readOnly,
        };
    }
}
