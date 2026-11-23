import { TagGroup } from "../../kit/ui/tag-group.tsx";

/** A group with no tag (spec/tag-group.md, `/tag-group/empty`). */
export function TagGroupEmpty() {
    return (
        <div className="flex flex-col items-start gap-4">
            <TagGroup.Root>
                <TagGroup.Label>Categories</TagGroup.Label>
                <TagGroup.List />
                <p className="text-xs">No categories.</p>
            </TagGroup.Root>
            <button type="button">After</button>
        </div>
    );
}
