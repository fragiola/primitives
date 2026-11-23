import type { PlainYearMonth } from "@fragiola/primitives-react/month-calendar";
import { useState } from "react";
import { isoMonth } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { MonthCalendar, PageView } from "../../kit/ui/month-calendar.tsx";

const MIN: PlainYearMonth = { year: 2025, month: 3 };
const MAX: PlainYearMonth = { year: 2027, month: 10 };
const isAugust2026 = (month: PlainYearMonth) =>
    month.year === 2026 && month.month === 8;

/** spec/month-calendar.md, `/month-calendar/basic` */
export function MonthCalendarBasic() {
    const [value, setValue] = useState<PlainYearMonth | null>(null);
    return (
        <>
            <MonthCalendar.Root
                value={value}
                onValueChange={setValue}
                min={MIN}
                max={MAX}
                isUnavailable={isAugust2026}
                locale="en-US"
            >
                <PageView prev="Previous year" next="Next year" />
            </MonthCalendar.Root>
            <Output values={{ value: isoMonth(value) }} />
        </>
    );
}
