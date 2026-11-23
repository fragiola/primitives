import { TagGroup } from "../../kit/ui/tag-group.tsx";
import type { Tag } from "./tags.ts";

/** The scenarios' Tags: each a TagCell with its name and, when removable, its RemoveButton. */
export function TagGroupTags({
    tags,
    removable = false,
    disabled = [],
}: {
    tags: readonly Tag[];
    removable?: boolean;
    disabled?: readonly string[];
}) {
    return tags.map((tag) => (
        <TagGroup.Tag
            key={tag.value}
            value={tag.value}
            disabled={disabled.includes(tag.value)}
        >
            <TagGroup.TagCell>
                {tag.label}
                {removable ? (
                    <TagGroup.RemoveButton aria-label={`Remove ${tag.label}`}>
                        ×
                    </TagGroup.RemoveButton>
                ) : null}
            </TagGroup.TagCell>
        </TagGroup.Tag>
    ));
}
