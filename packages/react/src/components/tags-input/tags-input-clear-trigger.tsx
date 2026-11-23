import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputContext } from "./tags-input-context.ts";

export interface TagsInputClearTriggerState {
    disabled: boolean;
}

/**
 * Removes every tag and the text, and focuses the Input; hidden while there is nothing to clear
 * (spec/tags-input.md).
 */
export function TagsInputClearTrigger(
    props: PartProps<TagsInputClearTriggerState>,
) {
    const context = useRequiredContext(
        TagsInputContext,
        "TagsInput.ClearTrigger",
    );
    const { disabled } = context;
    const state = { disabled };
    return renderElement("button", props, state, {
        type: "button",
        disabled,
        hidden: (context.empty && context.text === "") || undefined,
        "data-primitives-part": "tags-input-clear-trigger",
        ...stateAttributes(state),
        onMouseDown: (event: MouseEvent) => event.preventDefault(),
        onClick: (event: MouseEvent) => context.clear(event.nativeEvent),
    });
}
