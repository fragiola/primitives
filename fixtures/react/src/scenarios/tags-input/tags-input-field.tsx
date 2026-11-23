import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { TagsInput } from "../../kit/ui/tags-input.tsx";
import { TagsInputTags } from "./tags-input-tags.tsx";

/** A required TagsInput in a Field, and another in the same form (spec/tags-input.md). */
export function TagsInputField() {
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
                <Field.Root name="tags">
                    <Field.Label>Tags</Field.Label>
                    <TagsInput.Root required>
                        {({ value: tags }) => (
                            <TagsInput.Control>
                                <TagsInputTags value={tags} />
                                <TagsInput.Input />
                            </TagsInput.Control>
                        )}
                    </TagsInput.Root>
                    <Field.Description>
                        Press Enter to add a tag.
                    </Field.Description>
                    <Field.Error>Add at least one tag.</Field.Error>
                </Field.Root>
                <div className="flex flex-col items-start gap-1">
                    <label htmlFor="labels" className="text-sm font-medium">
                        Labels
                    </label>
                    <TagsInput.Root name="labels" defaultValue={["bug"]}>
                        {({ value: tags }) => (
                            <TagsInput.Control>
                                <TagsInputTags value={tags} />
                                <TagsInput.Input id="labels" />
                            </TagsInput.Control>
                        )}
                    </TagsInput.Root>
                </div>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
