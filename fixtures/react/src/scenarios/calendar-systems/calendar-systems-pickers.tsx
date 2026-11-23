import { DateRangePicker } from "@fragiola/primitives-react/date-range-picker";
import { MonthPicker } from "@fragiola/primitives-react/month-picker";
import { YearPicker } from "@fragiola/primitives-react/year-picker";
import { useState } from "react";
import { systemOf } from "../../kit/calendar-system.ts";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import { DatePickerInput, TypedDate } from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";
import {
    MonthCalendar,
    PageView,
    YearCalendar,
} from "../../kit/ui/month-calendar.tsx";

/** One picker's popup, named as its trigger. */
function Popup({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <DatePicker.Portal>
            <DatePicker.Positioner sideOffset={4}>
                <DatePicker.Popup aria-label={label}>
                    {children}
                </DatePicker.Popup>
            </DatePicker.Positioner>
        </DatePicker.Portal>
    );
}

/** spec/calendar-systems.md, `/calendar-systems/pickers` */
export function CalendarSystemsPickers({ locale }: { locale?: string }) {
    const calendar = systemOf(locale);
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Field.Root name="date">
                    <Field.Label>Date</Field.Label>
                    <DatePickerInput.Root
                        calendar={calendar}
                        locale={locale}
                        defaultValue={{ year: 2026, month: 11, day: 20 }}
                    >
                        <TypedDate trigger="Choose date" />
                        <Popup label="Choose date">
                            <Calendar.Root>
                                <MonthView />
                            </Calendar.Root>
                        </Popup>
                    </DatePickerInput.Root>
                </Field.Root>
                <DateRangePicker.Root
                    calendar={calendar}
                    locale={locale}
                    name="stay"
                >
                    <DatePicker.Trigger>Stay</DatePicker.Trigger>
                    <Popup label="Stay">
                        <RangeCalendar.Root>
                            <MonthView />
                        </RangeCalendar.Root>
                    </Popup>
                </DateRangePicker.Root>
                <MonthPicker.Root
                    calendar={calendar}
                    locale={locale}
                    name="month"
                >
                    <DatePicker.Trigger>Month</DatePicker.Trigger>
                    <Popup label="Month">
                        <MonthCalendar.Root>
                            <PageView prev="Previous year" next="Next year" />
                        </MonthCalendar.Root>
                    </Popup>
                </MonthPicker.Root>
                <YearPicker.Root
                    calendar={calendar}
                    locale={locale}
                    name="year"
                >
                    <DatePicker.Trigger>Year</DatePicker.Trigger>
                    <Popup label="Year">
                        <YearCalendar.Root>
                            <PageView prev="Previous years" next="Next years" />
                        </YearCalendar.Root>
                    </Popup>
                </YearPicker.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ form }} />
        </>
    );
}
