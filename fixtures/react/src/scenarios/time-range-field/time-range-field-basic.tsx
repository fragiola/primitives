import { isoTimeRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { RangeEnds, TimeRangeField } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "../date-field/use-field-output.ts";

/** spec/date-range-field.md, `/time-range-field/basic` */
export function TimeRangeFieldBasic() {
    const output = useFieldOutput(isoTimeRange);
    return (
        <>
            <Field.Root>
                <Field.Label>Opening hours</Field.Label>
                <TimeRangeField.Root
                    locale="en-US"
                    onValueChange={output.onValueChange}
                >
                    <RangeEnds start="Opens" end="Closes" />
                </TimeRangeField.Root>
            </Field.Root>
            <Output values={output.values} />
        </>
    );
}
