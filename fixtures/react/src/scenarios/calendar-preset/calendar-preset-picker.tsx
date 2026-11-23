import type {
    ChangeDetails,
    DateRange,
} from "@fragiola/primitives-react/calendar";
import { useState } from "react";
import { isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { CalendarPreset, PresetList } from "../../kit/ui/calendar-preset.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import {
    DateRangePickerInput,
    TypedRange,
} from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";

const THIS_WEEKEND: DateRange = {
    start: { year: 2026, month: 11, day: 21 },
    end: { year: 2026, month: 11, day: 22 },
};
const NEXT_WEEK: DateRange = {
    start: { year: 2026, month: 11, day: 23 },
    end: { year: 2026, month: 11, day: 29 },
};

/** spec/calendar.md, `/calendar-preset/picker` */
export function CalendarPresetPicker() {
    const [last, setLast] = useState<{ value: string; reason: string }>();
    const [changes, setChanges] = useState(0);
    return (
        <>
            <Field.Root>
                <Field.Label>Stay</Field.Label>
                <DateRangePickerInput.Root
                    locale="en-US"
                    onValueChange={(
                        value: DateRange | null,
                        details: ChangeDetails,
                    ) => {
                        setChanges((count) => count + 1);
                        setLast({
                            value: isoRange(value) ?? "none",
                            reason: details.reason,
                        });
                    }}
                >
                    <TypedRange
                        start="Check-in"
                        end="Check-out"
                        trigger="Choose dates"
                    />
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose dates">
                                <RangeCalendar.Root>
                                    <MonthView />
                                    <PresetList>
                                        <CalendarPreset value={THIS_WEEKEND}>
                                            This weekend
                                        </CalendarPreset>
                                        <CalendarPreset value={NEXT_WEEK}>
                                            Next week
                                        </CalendarPreset>
                                    </PresetList>
                                </RangeCalendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </DateRangePickerInput.Root>
            </Field.Root>
            <Output
                values={{
                    value: last?.value,
                    reason: last?.reason,
                    changes,
                }}
            />
        </>
    );
}
