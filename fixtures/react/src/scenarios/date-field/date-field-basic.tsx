import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { DateField } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "./use-field-output.ts";

/** spec/date-field.md, `/date-field/basic` */
export function DateFieldBasic({ locale }: { locale?: string }) {
    const output = useFieldOutput(isoDateTime);
    return (
        <>
            <Field.Root>
                <Field.Label>Birth date</Field.Label>
                <DateField.Root
                    locale={locale}
                    onValueChange={output.onValueChange}
                >
                    <DateField.Input>
                        {(segment) => (
                            <DateField.Segment
                                key={segment.index}
                                segment={segment}
                            />
                        )}
                    </DateField.Input>
                </DateField.Root>
            </Field.Root>
            <Output values={output.values} />
        </>
    );
}
