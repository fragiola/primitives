import type { ChangeDetails } from "@fragiola/primitives-react/tag-group";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { TagGroup } from "../../kit/ui/tag-group.tsx";
import { TagGroupTags } from "./tag-group-tags.tsx";
import { CATEGORIES, printList } from "./tags.ts";

/** Removable tags, no selection (spec/tag-group.md, `/tag-group/basic`). */
export function TagGroupBasic() {
    const [tags, setTags] = useState(CATEGORIES);
    const [removed, setRemoved] = useState<string>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <TagGroup.Root
                    onRemove={(value: string, details: ChangeDetails) => {
                        setTags((current) =>
                            current.filter((tag) => tag.value !== value),
                        );
                        setRemoved(value);
                        setReason(details.reason);
                    }}
                >
                    <TagGroup.Label>Categories</TagGroup.Label>
                    <TagGroup.List>
                        <TagGroupTags tags={tags} removable />
                    </TagGroup.List>
                    {tags.length === 0 ? (
                        <p className="text-xs">No categories.</p>
                    ) : null}
                </TagGroup.Root>
                <button type="button">After</button>
            </div>
            <Output
                values={{
                    tags: printList(tags.map((tag) => tag.value)),
                    removed,
                    reason,
                }}
            />
        </>
    );
}
