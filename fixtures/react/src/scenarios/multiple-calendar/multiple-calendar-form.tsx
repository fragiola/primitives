import type { PlainDate } from "@fragiola/primitives-react/multiple-calendar";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { MonthView } from "../../kit/ui/calendar.tsx";
import { MultipleCalendar } from "../../kit/ui/multiple-calendar.tsx";

const NOV_20: PlainDate[] = [{ year: 2026, month: 11, day: 20 }];

/** spec/calendar.md, `/multiple-calendar/form` */
export function MultipleCalendarForm() {
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
                <MultipleCalendar.Root
                    name="days"
                    defaultValue={NOV_20}
                    locale="en-US"
                >
                    <MonthView />
                </MultipleCalendar.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
