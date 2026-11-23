import type { PlainDate } from "@fragiola/primitives-react/date-field";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { DateField } from "../../kit/ui/date-field.tsx";
import { useFieldOutput } from "./use-field-output.ts";

const MIN = { year: 2026, month: 11, day: 10 };
const MAX = { year: 2026, month: 12, day: 5 };

/** Saturdays and Sundays. */
function isWeekend(date: PlainDate): boolean {
    const day = new Date(
        Date.UTC(date.year, date.month - 1, date.day),
    ).getUTCDay();
    return day === 0 || day === 6;
}

/** spec/date-field.md, `/date-field/min-max` */
export function DateFieldMinMax() {
    const output = useFieldOutput(isoDateTime);
    return (
        <>
            <DateField.Root
                locale="en-US"
                min={MIN}
                max={MAX}
                isDateUnavailable={isWeekend}
                onValueChange={output.onValueChange}
            >
                <DateField.Input aria-label="Arrival" />
            </DateField.Root>
            <Output values={{ value: output.values.value }} />
        </>
    );
}
