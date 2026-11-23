import type { ChangeDetails } from "@fragiola/primitives-react/tag-group";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagGroup } from "../../kit/ui/tag-group.tsx";
import { TagGroupTags } from "./tag-group-tags.tsx";
import { CATEGORIES, printList } from "./tags.ts";

/** A controlled multiple selection (spec/tag-group.md, `/tag-group/selection`). */
export function TagGroupSelection() {
    const [value, setValue] = useState<readonly string[]>(["gaming"]);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <TagGroup.Root
                selectionMode="multiple"
                value={value}
                onValueChange={(next: string[], details: ChangeDetails) => {
                    setValue(next);
                    setReason(details.reason);
                }}
            >
                <TagGroup.Label>Interests</TagGroup.Label>
                <TagGroup.List>
                    <TagGroupTags tags={CATEGORIES} />
                </TagGroup.List>
            </TagGroup.Root>
            <Output values={{ value: printList(value), reason }} />
        </>
    );
}
