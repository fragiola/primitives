import type {
    ChangeDetails,
    TagsInputInvalidDetails,
} from "@fragiola/primitives-react/tags-input";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagsInput } from "../../kit/ui/tags-input.tsx";
import { printList, TagsInputTags } from "./tags-input-tags.tsx";

/** An uncontrolled TagsInput (spec/tags-input.md, `/tags-input/basic`). */
export function TagsInputBasic() {
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
    const [invalid, setInvalid] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <label htmlFor="tags" className="text-sm font-medium">
                    Tags
                </label>
                <TagsInput.Root
                    defaultValue={["react", "vue"]}
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
                        <>
                            <TagsInput.Control>
                                <TagsInputTags value={tags} />
                                <TagsInput.Input id="tags" />
                            </TagsInput.Control>
                            <TagsInput.ClearTrigger aria-label="Clear tags">
                                ×
                            </TagsInput.ClearTrigger>
                        </>
                    )}
                </TagsInput.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ value, reason, invalid }} />
        </>
    );
}
