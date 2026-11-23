import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputContext } from "./tags-input-context.ts";

export interface TagsInputControlState {
    disabled: boolean;
    empty: boolean;
}

/** Holds the Tags and the Input; a press on it, outside them, focuses the Input (spec/tags-input.md). */
export function TagsInputControl(props: PartProps<TagsInputControlState>) {
    const context = useRequiredContext(TagsInputContext, "TagsInput.Control");
    const { disabled, empty } = context;
    const state = { disabled, empty };
    return renderElement("div", props, state, {
        "data-primitives-part": "tags-input-control",
        ...stateAttributes(state),
        onMouseDown: (event: MouseEvent) => {
            if (event.target === event.currentTarget && !disabled) {
                event.preventDefault();
                context.focusInput();
            }
        },
    });
}
