import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
} from "@angular/core";
import type { PlainDate } from "@fragiola/primitives/date";
import { dataValues } from "@fragiola/primitives-angular/internal";
import type { CalendarInputs, CalendarState } from "../utils/calendar-state.ts";

const optionalNumber = (value: unknown): number | undefined =>
    value === undefined || value === null ? undefined : numberAttribute(value);

/**
 * The inputs and the root element both calendar roots share (spec/calendar.md). Each root
 * declares its own typed `value` input and creates the state after it.
 */
@Directive({
    host: {
        "[attr.data-primitives-part]": "calendar.part('root')",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
    },
})
export abstract class CalendarRootBase {
    /** Dates before it are disabled. */
    readonly min = input<PlainDate | null | undefined>(undefined);
    /** Dates after it are disabled. */
    readonly max = input<PlainDate | null | undefined>(undefined);
    /** Unavailable dates can be focused but not chosen. */
    readonly isDateUnavailable = input<
        ((date: PlainDate) => boolean) | undefined
    >(undefined);
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    readonly locale = input<string | undefined>(undefined);
    /** `0`–`6`, Sunday = 0 (default: the locale's). */
    readonly firstDayOfWeek = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** How many months are shown side by side (default 1). */
    readonly visibleMonths = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Default: a bound picker's `readOnly`, else `false`; an explicit `false` wins over the picker's. */
    readonly readOnly = input<boolean | undefined, unknown>(undefined, {
        transform: (value: unknown) =>
            value === undefined ? undefined : booleanAttribute(value),
    });
    /** The root's state, for its parts and `exportAs`. */
    abstract readonly calendar: CalendarState;
    protected readonly data = computed(() =>
        dataValues({
            disabled: this.disabled(),
            readonly: this.calendar.readOnly(),
        }),
    );

    /** The inputs the state reads, with the root's own value input. */
    protected stateInputs(
        value: CalendarInputs["value"],
        valueChange: CalendarInputs["valueChange"],
        defaultValue: CalendarInputs["defaultValue"],
    ): CalendarInputs {
        return {
            value,
            valueChange,
            defaultValue,
            min: this.min,
            max: this.max,
            isDateUnavailable: this.isDateUnavailable,
            locale: this.locale,
            firstDayOfWeek: this.firstDayOfWeek,
            visibleMonths: this.visibleMonths,
            disabled: this.disabled,
            readOnly: this.readOnly,
        };
    }
}
