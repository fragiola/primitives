import type { PlainDate } from "@fragiola/primitives-react/date-picker";
import { DatePicker as Primitive } from "@fragiola/primitives-react/date-picker";
import { DateRangePicker } from "@fragiola/primitives-react/date-range-picker";
import { MonthPicker } from "@fragiola/primitives-react/month-picker";
import { MonthRangePicker } from "@fragiola/primitives-react/month-range-picker";
import { YearPicker } from "@fragiola/primitives-react/year-picker";
import { YearRangePicker } from "@fragiola/primitives-react/year-range-picker";
import { useState } from "react";
import { iso } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import {
    DatePickerInput,
    DateRangePickerInput,
    TypedDate,
    TypedRange,
} from "../../kit/ui/date-picker-input.tsx";
import { Dialog } from "../../kit/ui/dialog.tsx";
import { Field } from "../../kit/ui/field.tsx";
import {
    MonthCalendar,
    MonthRangeCalendar,
    PageView,
    YearCalendar,
    YearRangeCalendar,
} from "../../kit/ui/month-calendar.tsx";

/** spec/calendar.md, `/date-picker/in-dialog`: every picker kind inside a modal Dialog */
export function DatePickerInDialog() {
    const [value, setValue] = useState<PlainDate | null>(null);
    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>Plan the trip</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Popup>
                        <Dialog.Title>Plan the trip</Dialog.Title>
                        <div className="flex flex-col items-start gap-2">
                            <Primitive.Root
                                value={value}
                                onValueChange={setValue}
                                locale="en-US"
                            >
                                <DatePicker.Trigger>Date</DatePicker.Trigger>
                                <DatePicker.Portal>
                                    <DatePicker.Positioner sideOffset={4}>
                                        <DatePicker.Popup aria-label="Choose date">
                                            <Calendar.Root>
                                                <MonthView />
                                            </Calendar.Root>
                                        </DatePicker.Popup>
                                    </DatePicker.Positioner>
                                </DatePicker.Portal>
                            </Primitive.Root>
                            <DateRangePicker.Root locale="en-US">
                                <DatePicker.Trigger>Dates</DatePicker.Trigger>
                                <DatePicker.Portal>
                                    <DatePicker.Positioner sideOffset={4}>
                                        <DatePicker.Popup aria-label="Choose dates">
                                            <RangeCalendar.Root>
                                                <MonthView />
                                            </RangeCalendar.Root>
                                        </DatePicker.Popup>
                                    </DatePicker.Positioner>
                                </DatePicker.Portal>
                            </DateRangePicker.Root>
                            <Field.Root>
                                <Field.Label>Arrival</Field.Label>
                                <DatePickerInput.Root locale="en-US">
                                    <TypedDate trigger="Choose arrival" />
                                    <DatePicker.Portal>
                                        <DatePicker.Positioner sideOffset={4}>
                                            <DatePicker.Popup aria-label="Arrival date">
                                                <Calendar.Root>
                                                    <MonthView />
                                                </Calendar.Root>
                                            </DatePicker.Popup>
                                        </DatePicker.Positioner>
                                    </DatePicker.Portal>
                                </DatePickerInput.Root>
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>Stay</Field.Label>
                                <DateRangePickerInput.Root locale="en-US">
                                    <TypedRange
                                        start="Check-in"
                                        end="Check-out"
                                        trigger="Choose stay"
                                    />
                                    <DatePicker.Portal>
                                        <DatePicker.Positioner sideOffset={4}>
                                            <DatePicker.Popup aria-label="Stay dates">
                                                <RangeCalendar.Root>
                                                    <MonthView />
                                                </RangeCalendar.Root>
                                            </DatePicker.Popup>
                                        </DatePicker.Positioner>
                                    </DatePicker.Portal>
                                </DateRangePickerInput.Root>
                            </Field.Root>
                            <MonthPicker.Root locale="en-US">
                                <DatePicker.Trigger>Month</DatePicker.Trigger>
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
                            <MonthRangePicker.Root locale="en-US">
                                <DatePicker.Trigger>Months</DatePicker.Trigger>
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
                            <YearPicker.Root locale="en-US">
                                <DatePicker.Trigger>Year</DatePicker.Trigger>
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
                            <YearRangePicker.Root locale="en-US">
                                <DatePicker.Trigger>Years</DatePicker.Trigger>
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
                        </div>
                        <Dialog.Close>Close</Dialog.Close>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <Output values={{ value: iso(value) }} />
        </>
    );
}
