import type { YearMonthRange } from "@fragiola/primitives-react/month-range-calendar";
import { useState } from "react";
import { isoMonth, isoPeriod } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { MonthRangeCalendar, PageView } from "../../kit/ui/month-calendar.tsx";

/** spec/month-calendar.md, `/month-calendar/range` */
export function MonthCalendarRange() {
    const [value, setValue] = useState<YearMonthRange | null>(null);
    return (
        <>
            <MonthRangeCalendar.Root
                value={value}
                onValueChange={setValue}
                locale="en-US"
            >
                <PageView prev="Previous year" next="Next year" />
            </MonthRangeCalendar.Root>
            <Output values={{ value: isoPeriod(value, isoMonth) }} />
        </>
    );
}
