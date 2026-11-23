import type { FocusEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupContext } from "./tag-group-context.ts";

export interface TagGroupListState {
    empty: boolean;
    disabled: boolean;
}

/**
 * The `grid` of tags, a `group` while it holds none (spec/tag-group.md): it takes the focus after
 * the last removal.
 */
export function TagGroupList(props: PartProps<TagGroupListState>) {
    const context = useRequiredContext(TagGroupContext, "TagGroup.List");
    const { empty, disabled } = context;
    const state = { empty, disabled };
    return renderElement(
        "div",
        props,
        state,
        {
            role: empty ? "group" : "grid",
            tabIndex: empty ? -1 : undefined,
            ...context.fieldAria,
            "aria-labelledby": context.labelledBy,
            "aria-multiselectable":
                context.multiple && !empty ? "true" : undefined,
            "data-primitives-part": "tag-group-list",
            ...context.fieldAttributes,
            ...stateAttributes(state),
            onKeyDown: context.onListKeyDown,
            onFocus: context.onListFocus,
            onBlur: (event: FocusEvent<HTMLElement>) =>
                context.onListBlur(event.relatedTarget, event.currentTarget),
        },
        context.setList,
    );
}
