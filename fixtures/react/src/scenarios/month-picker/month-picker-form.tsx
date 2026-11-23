import {
    MonthPicker,
    type PlainYearMonth,
} from "@fragiola/primitives-react/month-picker";
import {
    MonthRangePicker,
    type YearMonthRange,
} from "@fragiola/primitives-react/month-range-picker";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { isoMonth, isoPeriod } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import {
    MonthCalendar,
    MonthRangeCalendar,
    PageView,
} from "../../kit/ui/month-calendar.tsx";

const MIN: PlainYearMonth = { year: 2026, month: 11 };

/** spec/month-calendar.md, `/month-picker/form` */
export function MonthPickerForm() {
    const [expiry, setExpiry] = useState<PlainYearMonth | null>(null);
    const [period, setPeriod] = useState<YearMonthRange | null>(null);
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
                <MonthPicker.Root
                    name="expiry"
                    required
                    min={MIN}
                    value={expiry}
                    onValueChange={setExpiry}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Expiry: {isoMonth(expiry) ?? "none"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose month">
                                <MonthCalendar.Root>
                                    <PageView
                                        prev="Previous year"
                                        next="Next year"
                                    />
                                </MonthCalendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </MonthPicker.Root>
                <MonthRangePicker.Root
                    name="period"
                    value={period}
                    onValueChange={setPeriod}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Period: {isoPeriod(period, isoMonth) ?? "none"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose months">
                                <MonthRangeCalendar.Root>
                                    <PageView
                                        prev="Previous year"
                                        next="Next year"
                                    />
                                </MonthRangeCalendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </MonthRangePicker.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
