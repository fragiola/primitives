import type { PlainDate } from "@fragiola/primitives-react/calendar";
import { DatePicker as Picker } from "@fragiola/primitives-react/date-picker";
import {
    type DateRange,
    DateRangePicker as RangePicker,
} from "@fragiola/primitives-react/date-range-picker";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { iso, isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { Checkbox, CheckboxGroup } from "../../kit/ui/checkbox.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Form } from "../../kit/ui/form.tsx";
import { validateToppings } from "./validators.ts";

const TOPPINGS = [
    { value: "cheese", label: "Cheese" },
    { value: "ham", label: "Ham" },
    { value: "pineapple", label: "Pineapple" },
];

export function FieldMoreControls() {
    const [arrival, setArrival] = useState<PlainDate | null>(null);
    const [stay, setStay] = useState<DateRange | null>(null);
    const [form, setForm] = useState<string>();
    return (
        <>
            <Form
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Field.Root name="toppings" validate={validateToppings}>
                    <Field.Label>Toppings</Field.Label>
                    <CheckboxGroup defaultValue={[]}>
                        {TOPPINGS.map((topping) => (
                            <label
                                key={topping.value}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Checkbox.Root value={topping.value} />
                                {topping.label}
                            </label>
                        ))}
                    </CheckboxGroup>
                    <Field.Description>Pick at least one.</Field.Description>
                    <Field.Error />
                </Field.Root>
                <Field.Root name="arrival">
                    <Field.Label>Arrival</Field.Label>
                    <Picker.Root
                        value={arrival}
                        onValueChange={setArrival}
                        required
                        locale="en-US"
                    >
                        <DatePicker.Trigger>
                            Arrival: {iso(arrival) ?? "none"}
                        </DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner sideOffset={4}>
                                <DatePicker.Popup aria-label="Choose date">
                                    <Calendar.Root>
                                        <MonthView />
                                    </Calendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </Picker.Root>
                    <Field.Description>The day you arrive.</Field.Description>
                    <Field.Error>Choose a date.</Field.Error>
                </Field.Root>
                <Field.Root name="stay">
                    <Field.Label>Stay</Field.Label>
                    <RangePicker.Root
                        value={stay}
                        onValueChange={setStay}
                        required
                        locale="en-US"
                    >
                        <DatePicker.Trigger>
                            Stay: {isoRange(stay) ?? "none"}
                        </DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner sideOffset={4}>
                                <DatePicker.Popup aria-label="Choose dates">
                                    <RangeCalendar.Root>
                                        <MonthView />
                                    </RangeCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </RangePicker.Root>
                    <Field.Description>
                        From check-in to check-out.
                    </Field.Description>
                    <Field.Error>Choose your dates.</Field.Error>
                </Field.Root>
                <button type="submit">Submit</button>
            </Form>
            <Output values={{ form }} />
        </>
    );
}
