import type { PlainTime } from "@fragiola/primitives-react/time-field";
import { isoTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { TimeField } from "../../kit/ui/date-field.tsx";
import { useFieldOutput } from "../date-field/use-field-output.ts";

const time = (hour: number): PlainTime => ({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
});

/** spec/date-field.md, `/time-field/min-max` */
export function TimeFieldMinMax() {
    const output = useFieldOutput((value: PlainTime) => isoTime(value, true));
    return (
        <>
            <TimeField.Root
                locale="en-US"
                hourCycle={24}
                granularity="second"
                min={time(9)}
                max={time(17)}
                defaultValue={time(9)}
                onValueChange={output.onValueChange}
            >
                <TimeField.Input aria-label="Opening" />
            </TimeField.Root>
            <Output values={{ value: output.values.value }} />
        </>
    );
}
