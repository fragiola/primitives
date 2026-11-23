import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupContext, TagGroupTagContext } from "./tag-group-context.ts";

export interface TagGroupRemoveButtonState {
    disabled: boolean;
}

/** Removes its Tag (spec/tag-group.md, "Pointer"); a press never takes the focus. */
export function TagGroupRemoveButton(
    props: PartProps<TagGroupRemoveButtonState>,
) {
    const context = useRequiredContext(
        TagGroupContext,
        "TagGroup.RemoveButton",
    );
    const tag = useRequiredContext(TagGroupTagContext, "TagGroup.RemoveButton");
    const { disabled } = tag;
    const state = { disabled };
    return renderElement("button", props, state, {
        type: "button",
        tabIndex: -1,
        disabled,
        "data-primitives-part": "tag-group-remove-button",
        ...stateAttributes(state),
        onMouseDown: (event: MouseEvent) => event.preventDefault(),
        onClick: (event: MouseEvent) => {
            // the Tag's own click selects nothing for it
            event.preventDefault();
            const element = tag.element();
            if (element !== null) {
                context.remove(element, "chip-remove-press", event.nativeEvent);
            }
        },
    });
}
