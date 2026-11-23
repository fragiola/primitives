import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagGroup } from "../../kit/ui/tag-group.tsx";
import { TagGroupTags } from "./tag-group-tags.tsx";
import { printList, SORTS } from "./tags.ts";

/** An uncontrolled single selection (spec/tag-group.md, `/tag-group/single`). */
export function TagGroupSingle() {
    const [value, setValue] = useState<string>();
    return (
        <>
            <TagGroup.Root
                selectionMode="single"
                onValueChange={(next: string[]) => setValue(printList(next))}
            >
                <TagGroup.Label>Sort</TagGroup.Label>
                <TagGroup.List>
                    <TagGroupTags tags={SORTS} />
                </TagGroup.List>
            </TagGroup.Root>
            <Output values={{ value }} />
        </>
    );
}
