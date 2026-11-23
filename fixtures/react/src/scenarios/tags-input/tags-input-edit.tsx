import type {
    ChangeDetails,
    TagsInputInvalidDetails,
} from "@fragiola/primitives-react/tags-input";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagsInput } from "../../kit/ui/tags-input.tsx";
import { printList, TagsInputTags } from "./tags-input-tags.tsx";

/** Tags edited in place (spec/tags-input.md, `/tags-input/edit`). */
export function TagsInputEdit() {
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
    const [invalid, setInvalid] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <label htmlFor="edit-tags" className="text-sm font-medium">
                    Tags
                </label>
                <TagsInput.Root
                    editable
                    defaultValue={["one", "two", "three"]}
                    onValueChange={(next: string[], details: ChangeDetails) => {
                        setValue(printList(next));
                        setReason(details.reason);
                    }}
                    onValueInvalid={(
                        _: string,
                        details: TagsInputInvalidDetails,
                    ) => setInvalid(details.cause)}
                >
                    {({ value: tags }) => (
                        <TagsInput.Control>
                            <TagsInputTags value={tags} editable />
                            <TagsInput.Input id="edit-tags" />
                        </TagsInput.Control>
                    )}
                </TagsInput.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ value, reason, invalid }} />
        </>
    );
}
