import { computed, inject, type Signal } from "@angular/core";
import type { CalendarValue } from "@fragiola/primitives-angular/calendar";
import type { ChangeReason } from "@fragiola/primitives-angular/internal";
import { DATE_PICKER } from "../utils/date-picker-state.ts";

/** The part hook of the enclosing `[datePickerRoot]` or `[dateRangePickerRoot]`: its state and `setOpen`. */
export function injectDatePicker(): {
    state: Signal<{ open: boolean; value: CalendarValue }>;
    setOpen: (open: boolean, reason?: ChangeReason) => void;
} {
    const picker = inject(DATE_PICKER, { optional: true });
    if (picker === null) {
        throw new Error(
            "injectDatePicker() must be used inside [datePickerRoot] or [dateRangePickerRoot]",
        );
    }
    return {
        state: computed(() => ({
            open: picker.overlay.open(),
            value: picker.value(),
        })),
        setOpen: (open, reason = "none") =>
            picker.overlay.setOpen(open, reason),
    };
}
