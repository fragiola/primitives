import type { YearRange } from "@fragiola/primitives-react/year-range-calendar";
import { useState } from "react";
import { isoPeriod, isoYear } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { PageView, YearRangeCalendar } from "../../kit/ui/month-calendar.tsx";

/** spec/month-calendar.md, `/year-calendar/range` */
export function YearCalendarRange() {
    const [value, setValue] = useState<YearRange | null>(null);
    return (
        <>
            <YearRangeCalendar.Root
                value={value}
                onValueChange={setValue}
                locale="en-US"
            >
                <PageView prev="Previous years" next="Next years" />
            </YearRangeCalendar.Root>
            <Output values={{ value: isoPeriod(value, isoYear) }} />
        </>
    );
}
