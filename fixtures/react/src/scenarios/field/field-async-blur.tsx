import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { checkUsernameSlowly } from "./validators.ts";

/** spec/field.md, `/field/async-blur`: a change hides the error an earlier run showed, at once. */
export function FieldAsyncBlur() {
    const [resolved, setResolved] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <Field.Root
                    name="username"
                    validationMode="onBlur"
                    validate={(value) =>
                        checkUsernameSlowly(value, setResolved)
                    }
                >
                    <Field.Label>Username</Field.Label>
                    <Field.Control />
                    <Field.Error />
                </Field.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ resolved }} />
        </>
    );
}
