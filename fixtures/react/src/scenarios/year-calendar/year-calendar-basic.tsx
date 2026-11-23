import type { PlainYear } from "@fragiola/primitives-react/year-calendar";
import { useState } from "react";
import { isoYear } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { PageView, YearCalendar } from "../../kit/ui/month-calendar.tsx";

const MIN: PlainYear = { year: 2010 };
const MAX: PlainYear = { year: 2035 };

/** spec/month-calendar.md, `/year-calendar/basic` */
export function YearCalendarBasic() {
    const [value, setValue] = useState<PlainYear | null>(null);
    return (
        <>
            <YearCalendar.Root
                value={value}
                onValueChange={setValue}
                min={MIN}
                max={MAX}
                locale="en-US"
            >
                <PageView prev="Previous years" next="Next years" />
            </YearCalendar.Root>
            <Output values={{ value: isoYear(value) }} />
        </>
    );
}
