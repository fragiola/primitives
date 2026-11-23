import {
    type FocusEvent,
    type MouseEvent,
    useLayoutEffect,
    useMemo,
} from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupContext, TagGroupTagContext } from "./tag-group-context.ts";

export interface TagGroupTagState {
    selected: boolean;
    disabled: boolean;
}

export interface TagGroupTagProps extends PartProps<TagGroupTagState> {
    /** The value it selects and removes (unique in the group). */
    value: string;
    /** Never focused, selected nor removed. */
    disabled?: boolean;
}

/** A `row`, focusable with a roving `tabindex` (spec/tag-group.md); holds one TagCell. */
export function TagGroupTag({
    value,
    disabled: disabledProp = false,
    ...props
}: TagGroupTagProps) {
    const context = useRequiredContext(TagGroupContext, "TagGroup.Tag");
    const [element, ref] = useElement<HTMLElement>();
    const { register } = context;
    useLayoutEffect(
        () =>
            element === null
                ? undefined
                : register({ element, value, disabled: disabledProp }),
        [element, value, disabledProp, register],
    );
    const disabled =
        disabledProp ||
        context.disabled ||
        context.disabledKeys.includes(value);
    const selected = context.selected.includes(value);
    const state = { selected, disabled };
    const tag = useMemo(
        () => ({ disabled, element: () => element }),
        [disabled, element],
    );
    return (
        <TagGroupTagContext.Provider value={tag}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "row",
                    // a disabled tag never takes focus (spec/tag-group.md, "Keyboard")
                    tabIndex: disabled
                        ? undefined
                        : element !== null && context.tabStop === element
                          ? 0
                          : -1,
                    "aria-selected": context.selectable
                        ? selected
                            ? "true"
                            : "false"
                        : undefined,
                    "aria-disabled": disabled ? "true" : undefined,
                    "data-primitives-part": "tag-group-tag",
                    ...stateAttributes(state),
                    onFocus: (event: FocusEvent) => {
                        if (element !== null && event.target === element) {
                            context.focused(element);
                        }
                    },
                    onClick: (event: MouseEvent) => {
                        // a RemoveButton's press prevents its click: it selects nothing
                        if (element !== null && !event.defaultPrevented) {
                            context.press(element, event.nativeEvent);
                        }
                    },
                },
                ref,
            )}
        </TagGroupTagContext.Provider>
    );
}
