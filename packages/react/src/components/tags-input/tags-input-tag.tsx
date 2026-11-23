import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputContext, TagsInputTagContext } from "./tags-input-context.ts";

export interface TagsInputTagState {
    disabled: boolean;
    editing: boolean;
}

export interface TagsInputTagProps extends PartProps<TagsInputTagState> {
    /** Its position in the value. */
    index: number;
}

/** One tag, focusable out of the tab order (spec/tags-input.md, "Keyboard"). */
export function TagsInputTag({ index, ...props }: TagsInputTagProps) {
    const context = useRequiredContext(TagsInputContext, "TagsInput.Tag");
    const { disabled } = context;
    const editing = context.editing?.index === index;
    const state = { disabled, editing };
    const tag = useMemo(
        () => ({ index, editing, disabled }),
        [index, editing, disabled],
    );
    return (
        <TagsInputTagContext.Provider value={tag}>
            {renderElement("div", props, state, {
                tabIndex: disabled ? undefined : -1,
                "data-primitives-part": "tags-input-tag",
                ...stateAttributes(state),
                onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                    if (!disabled) {
                        context.onTagKeyDown(event, index);
                    }
                },
                onDoubleClick: () => context.startEdit(index),
            })}
        </TagsInputTagContext.Provider>
    );
}
