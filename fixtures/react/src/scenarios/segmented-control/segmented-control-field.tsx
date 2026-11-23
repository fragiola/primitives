import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { SegmentedControl } from "../../kit/ui/segmented-control.tsx";
import { Segments } from "./segments.tsx";
import { DENSITIES } from "./views.ts";

/** A required control in a Field (spec/segmented-control.md, `/segmented-control/field`). */
export function SegmentedControlField() {
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Field.Root>
                    <Field.Label>Density</Field.Label>
                    <SegmentedControl.Root required name="density">
                        <Segments segments={DENSITIES} />
                        <SegmentedControl.Indicator />
                    </SegmentedControl.Root>
                    <Field.Description>Spacing of the rows.</Field.Description>
                    <Field.Error>Choose a density.</Field.Error>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
