import type { ChangeDetails } from "@fragiola/primitives-react/tags-input";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagsInput } from "../../kit/ui/tags-input.tsx";
import { printList, TagsInputTags } from "./tags-input-tags.tsx";

/** The three `blurBehavior`s (spec/tags-input.md, `/tags-input/blur`). */
export function TagsInputBlur() {
    const [add, setAdd] = useState<string>();
    const [addReason, setAddReason] = useState<string>();
    const [clear, setClear] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <label htmlFor="add-on-blur" className="text-sm font-medium">
                    Add on blur
                </label>
                <TagsInput.Root
                    blurBehavior="add"
                    onValueChange={(next: string[], details: ChangeDetails) => {
                        setAdd(printList(next));
                        setAddReason(details.reason);
                    }}
                >
                    {({ value: tags }) => (
                        <TagsInput.Control>
                            <TagsInputTags value={tags} />
                            <TagsInput.Input id="add-on-blur" />
                        </TagsInput.Control>
                    )}
                </TagsInput.Root>
                <label htmlFor="clear-on-blur" className="text-sm font-medium">
                    Clear on blur
                </label>
                <TagsInput.Root
                    blurBehavior="clear"
                    onValueChange={(next: string[]) =>
                        setClear(printList(next))
                    }
                >
                    {({ value: tags }) => (
                        <TagsInput.Control>
                            <TagsInputTags value={tags} />
                            <TagsInput.Input id="clear-on-blur" />
                        </TagsInput.Control>
                    )}
                </TagsInput.Root>
                <label htmlFor="keep-on-blur" className="text-sm font-medium">
                    Keep on blur
                </label>
                <TagsInput.Root>
                    {({ value: tags }) => (
                        <TagsInput.Control>
                            <TagsInputTags value={tags} />
                            <TagsInput.Input id="keep-on-blur" />
                        </TagsInput.Control>
                    )}
                </TagsInput.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ add, "add-reason": addReason, clear }} />
        </>
    );
}
