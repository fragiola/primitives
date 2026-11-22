import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
} from "@angular/core";
import type { PlainDate } from "@fragiola/primitives/date";
import type { CalendarOptions } from "@fragiola/primitives-angular/calendar";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/internal";
import type { DatePickerState } from "../utils/date-picker-state.ts";

const optionalNumber = (value: unknown): number | undefined =>
    value === undefined || value === null ? undefined : numberAttribute(value);

/**
 * The open state, the calendar options and the form props both pickers share; each declares its
 * typed value.
 */
@Directive()
export abstract class DatePickerRootBase {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    readonly openChangeDetails = output<OpenChangeEvent>();
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
    /** The form name of its hidden input (a Field's `name` wins; spec/calendar.md, "Forms"). */
    readonly name = input<string | undefined>(undefined);
    /** A native form's validation blocks a submission with no value. */
    readonly required = input(false, { transform: booleanAttribute });
    /** The trigger cannot open the popup; the hidden input submits nothing. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The popup opens, but its calendar chooses nothing. */
    readonly readOnly = input(false, { transform: booleanAttribute });
    /** The picker's state, for its parts and `exportAs`. */
    abstract readonly picker: DatePickerState;
    protected readonly options = computed<CalendarOptions>(() => ({
        min: this.min(),
        max: this.max(),
        isDateUnavailable: this.isDateUnavailable(),
        locale: this.locale(),
        firstDayOfWeek: this.firstDayOfWeek(),
        visibleMonths: this.visibleMonths(),
    }));
}
