import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagGroup } from "../../kit/ui/tag-group.tsx";
import { TagGroupTags } from "./tag-group-tags.tsx";
import { CATEGORIES, printList } from "./tags.ts";

/** `disabledKeys` and a disabled Tag (spec/tag-group.md, `/tag-group/disabled`). */
export function TagGroupDisabled() {
    const [tags, setTags] = useState(CATEGORIES);
    const [value, setValue] = useState<readonly string[]>([]);
    return (
        <>
            <TagGroup.Root
                selectionMode="multiple"
                disabledKeys={["travel"]}
                value={value}
                onValueChange={(next: string[]) => setValue(next)}
                onRemove={(removed: string) =>
                    setTags((current) =>
                        current.filter((tag) => tag.value !== removed),
                    )
                }
            >
                <TagGroup.Label>Categories</TagGroup.Label>
                <TagGroup.List>
                    <TagGroupTags tags={tags} removable disabled={["sports"]} />
                </TagGroup.List>
            </TagGroup.Root>
            <Output
                values={{
                    tags: printList(tags.map((tag) => tag.value)),
                    value: printList(value),
                }}
            />
        </>
    );
}
