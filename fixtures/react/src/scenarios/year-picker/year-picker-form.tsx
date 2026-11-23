import {
    type PlainYear,
    YearPicker,
} from "@fragiola/primitives-react/year-picker";
import {
    type YearRange,
    YearRangePicker,
} from "@fragiola/primitives-react/year-range-picker";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { isoPeriod, isoYear } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import {
    PageView,
    YearCalendar,
    YearRangeCalendar,
} from "../../kit/ui/month-calendar.tsx";

/** spec/month-calendar.md, `/year-picker/form` */
export function YearPickerForm() {
    const [year, setYear] = useState<PlainYear | null>(null);
    const [years, setYears] = useState<YearRange | null>(null);
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <YearPicker.Root
                    name="year"
                    value={year}
                    onValueChange={setYear}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Year: {isoYear(year) ?? "none"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose year">
                                <YearCalendar.Root>
                                    <PageView
                                        prev="Previous years"
                                        next="Next years"
                                    />
                                </YearCalendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </YearPicker.Root>
                <YearRangePicker.Root
                    name="years"
                    value={years}
                    onValueChange={setYears}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Years: {isoPeriod(years, isoYear) ?? "none"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose years">
                                <YearRangeCalendar.Root>
                                    <PageView
                                        prev="Previous years"
                                        next="Next years"
                                    />
                                </YearRangeCalendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </YearRangePicker.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ form }} />
        </>
    );
}
