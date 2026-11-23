import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { TagsInputTagContext } from "./tags-input-context.ts";

/** A Tag's text (the consumer's children); hidden while the tag is edited. */
export function TagsInputTagText(props: PartProps<{ editing: boolean }>) {
    const tag = useRequiredContext(TagsInputTagContext, "TagsInput.TagText");
    return renderElement(
        "span",
        props,
        { editing: tag.editing },
        {
            hidden: tag.editing || undefined,
            "data-primitives-part": "tags-input-tag-text",
        },
    );
}
