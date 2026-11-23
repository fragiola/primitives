import { Editable } from "../../kit/ui/editable.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** A placeholder, a disabled and a read-only Editable (spec/editable.md, `/editable/states`). */
export function EditableStates() {
    return (
        <div className="flex flex-col items-start gap-4">
            <Field.Root>
                <Field.Label>Subtitle</Field.Label>
                <Editable.Root placeholder="Add a subtitle" maxLength={12}>
                    <Editable.Area>
                        <Editable.Preview />
                        <Editable.Input />
                    </Editable.Area>
                    <Editable.EditTrigger aria-label="Edit subtitle" />
                </Editable.Root>
            </Field.Root>
            <Field.Root>
                <Field.Label>Owner</Field.Label>
                <Editable.Root disabled defaultValue="Ana">
                    <Editable.Area>
                        <Editable.Preview />
                        <Editable.Input />
                    </Editable.Area>
                    <Editable.EditTrigger aria-label="Edit owner" />
                </Editable.Root>
            </Field.Root>
            <Field.Root>
                <Field.Label>Created</Field.Label>
                <Editable.Root readOnly defaultValue="2026-11-23">
                    <Editable.Area>
                        <Editable.Preview />
                        <Editable.Input />
                    </Editable.Area>
                    <Editable.EditTrigger aria-label="Edit created" />
                </Editable.Root>
            </Field.Root>
        </div>
    );
}
