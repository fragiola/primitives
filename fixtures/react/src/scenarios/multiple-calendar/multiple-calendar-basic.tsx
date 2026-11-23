import type {
    ChangeDetails,
    PlainDate,
} from "@fragiola/primitives-react/multiple-calendar";
import { useState } from "react";
import { iso } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { MonthView } from "../../kit/ui/calendar.tsx";
import { MultipleCalendar } from "../../kit/ui/multiple-calendar.tsx";

/** spec/calendar.md, `/multiple-calendar/basic` */
export function MultipleCalendarBasic() {
    const [value, setValue] = useState<PlainDate[]>([]);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <MultipleCalendar.Root
                value={value}
                onValueChange={(next: PlainDate[], details: ChangeDetails) => {
                    setValue(next);
                    setReason(details.reason);
                }}
                maxSelected={3}
                locale="en-US"
            >
                <MonthView />
            </MultipleCalendar.Root>
            <Output
                values={{
                    value:
                        value.length > 0 ? value.map(iso).join(",") : undefined,
                    reason,
                }}
            />
        </>
    );
}
