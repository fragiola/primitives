import { isoTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { TimeField } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "../date-field/use-field-output.ts";

/** spec/date-field.md, `/time-field/basic` */
export function TimeFieldBasic({ locale }: { locale?: string }) {
    const output = useFieldOutput(isoTime);
    return (
        <>
            <Field.Root>
                <Field.Label>Meeting time</Field.Label>
                <TimeField.Root
                    locale={locale}
                    onValueChange={output.onValueChange}
                >
                    <TimeField.Input />
                </TimeField.Root>
            </Field.Root>
            <Output values={output.values} />
        </>
    );
}
