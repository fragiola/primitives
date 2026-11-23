import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
} from "@angular/core";
import type {
    OpenChangeEvent,
    OverlayActions,
} from "@fragiola/primitives-angular/internal";
import type {
    MonthCalendarItem,
    MonthCalendarOptions,
} from "@fragiola/primitives-angular/month-calendar";
import type { MonthPickerState } from "../utils/month-picker-state.ts";

const optionalNumber = (value: unknown): number | undefined =>
    value === undefined || value === null ? undefined : numberAttribute(value);

/**
 * The open state, the calendar options and the form props every month and year picker shares
 * (the DatePicker's, spec/month-calendar.md); each declares its typed value, bounds and
 * `isUnavailable`.
 */
@Directive()
export abstract class MonthPickerRootBase implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** A BCP 47 tag, passed to the bound calendar. */
    readonly locale = input<string | undefined>(undefined);
    /** Items per row, passed to the bound calendar (default 3). */
    readonly columns = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** The form name of its hidden input (a Field's `name` wins). */
    readonly name = input<string | undefined>(undefined);
    /** A native form's validation blocks a submission with no value. */
    readonly required = input(false, { transform: booleanAttribute });
    /** The trigger cannot open the popup; the hidden input submits nothing. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The popup opens, but its calendar chooses nothing. */
    readonly readOnly = input(false, { transform: booleanAttribute });
    abstract readonly min: () => MonthCalendarItem | null | undefined;
    abstract readonly max: () => MonthCalendarItem | null | undefined;
    abstract readonly isUnavailable: () =>
        | ((item: never) => boolean)
        | undefined;
    /** The picker's state, for its parts and `exportAs`. */
    abstract readonly state: MonthPickerState;

    /** The DatePicker's view of it, as `[datePickerRoot]` exposes it. */
    get picker() {
        return this.state.picker;
    }

    /** Closes the popup (reason `imperative-action`). */
    close(): void {
        this.state.picker.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.state.picker.overlay.unmount();
    }

    protected readonly options = computed<MonthCalendarOptions>(() => ({
        min: this.min(),
        max: this.max(),
        isUnavailable: this.isUnavailable() as
            | ((item: MonthCalendarItem) => boolean)
            | undefined,
        locale: this.locale(),
        columns: this.columns(),
    }));
}
