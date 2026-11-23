import type {
    ChangeDetails,
    TagsInputInvalidDetails,
} from "@fragiola/primitives-react/tags-input";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagsInput } from "../../kit/ui/tags-input.tsx";
import { printList, TagsInputTags } from "./tags-input-tags.tsx";

/** `delimiter`, `max` and `validate` (spec/tags-input.md, `/tags-input/options`). */
export function TagsInputOptions() {
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
    const [invalid, setInvalid] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <label htmlFor="emails" className="text-sm font-medium">
                    Emails
                </label>
                <TagsInput.Root
                    delimiter=";"
                    max={3}
                    validate={(tag: string) => tag.includes("@")}
                    onValueChange={(next: string[], details: ChangeDetails) => {
                        setValue(printList(next));
                        setReason(details.reason);
                    }}
                    onValueInvalid={(
                        text: string,
                        details: TagsInputInvalidDetails,
                    ) => setInvalid(`${details.cause} ${text}`)}
                >
                    {({ value: tags }) => (
                        <TagsInput.Control>
                            <TagsInputTags value={tags} />
                            <TagsInput.Input id="emails" />
                        </TagsInput.Control>
                    )}
                </TagsInput.Root>
            </div>
            <Output values={{ value, reason, invalid }} />
        </>
    );
}
