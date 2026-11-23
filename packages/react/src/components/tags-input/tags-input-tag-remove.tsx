import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputContext, TagsInputTagContext } from "./tags-input-context.ts";

export interface TagsInputTagRemoveState {
    disabled: boolean;
}

/** Removes its Tag and focuses the Input (spec/tags-input.md, "Pointer"). */
export function TagsInputTagRemove(props: PartProps<TagsInputTagRemoveState>) {
    const context = useRequiredContext(TagsInputContext, "TagsInput.TagRemove");
    const tag = useRequiredContext(TagsInputTagContext, "TagsInput.TagRemove");
    const { disabled } = tag;
    const state = { disabled };
    return renderElement("button", props, state, {
        type: "button",
        tabIndex: -1,
        disabled,
        hidden: tag.editing || undefined,
        "data-primitives-part": "tags-input-tag-remove",
        ...stateAttributes(state),
        onMouseDown: (event: MouseEvent) => event.preventDefault(),
        onClick: (event: MouseEvent) => {
            context.remove(tag.index, "chip-remove-press", event.nativeEvent);
            context.focusInput();
        },
    });
}
