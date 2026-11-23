import { isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { DateRangeField, RangeEnds } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "../date-field/use-field-output.ts";

/** spec/date-range-field.md, `/date-range-field/basic` */
export function DateRangeFieldBasic() {
    const output = useFieldOutput(isoRange);
    return (
        <>
            <Field.Root>
                <Field.Label>Stay</Field.Label>
                <DateRangeField.Root
                    locale="en-US"
                    onValueChange={output.onValueChange}
                >
                    <RangeEnds start="Start date" end="End date" />
                </DateRangeField.Root>
            </Field.Root>
            <Output values={output.values} />
        </>
    );
}
