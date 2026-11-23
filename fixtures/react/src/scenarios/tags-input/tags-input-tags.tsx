import { TagsInput } from "../../kit/ui/tags-input.tsx";

/** The scenarios' Tags: a TagText, a TagRemove "Remove <tag>" and, when editable, a TagInput. */
export function TagsInputTags({
    value,
    editable = false,
}: {
    value: readonly string[];
    editable?: boolean;
}) {
    return value.map((tag, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a tag is its place in the value
        <TagsInput.Tag key={index} index={index}>
            <TagsInput.TagText>{tag}</TagsInput.TagText>
            {editable ? <TagsInput.TagInput aria-label="Edit tag" /> : null}
            <TagsInput.TagRemove aria-label={`Remove ${tag}`}>
                ×
            </TagsInput.TagRemove>
        </TagsInput.Tag>
    ));
}

/** A list as its values joined with `,`, `none` when empty. */
export function printList(values: readonly string[] | undefined): string {
    return values === undefined || values.length === 0
        ? "none"
        : values.join(",");
}
