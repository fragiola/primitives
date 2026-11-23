import {
    type FocusEvent,
    type FormEvent,
    type KeyboardEvent,
    useLayoutEffect,
    useRef,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { TagsInputContext, TagsInputTagContext } from "./tags-input-context.ts";

export interface TagsInputTagInputState {
    editing: boolean;
}

/**
 * Edits its Tag in place (spec/tags-input.md, "Editing a tag"): `hidden` until the tag is edited,
 * then focused with its text selected.
 */
export function TagsInputTagInput(props: PartProps<TagsInputTagInputState>) {
    const context = useRequiredContext(TagsInputContext, "TagsInput.TagInput");
    const tag = useRequiredContext(TagsInputTagContext, "TagsInput.TagInput");
    const { editing, index } = tag;
    const element = useRef<HTMLInputElement | null>(null);
    // the edit starts: it takes the focus once shown
    useLayoutEffect(() => {
        if (editing) {
            element.current?.focus();
            element.current?.select();
        }
    }, [editing]);
    return renderElement(
        "input",
        props,
        { editing },
        {
            tabIndex: -1,
            hidden: !editing || undefined,
            disabled: context.disabled,
            value: editing ? (context.editing?.text ?? "") : "",
            "data-primitives-part": "tags-input-tag-input",
            onChange: (event: FormEvent<HTMLInputElement>) =>
                context.setEditText(event.currentTarget.value),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (
                    !editing ||
                    event.nativeEvent.isComposing ||
                    event.keyCode === 229
                ) {
                    return;
                }
                if (event.key === "Enter") {
                    event.preventDefault();
                    context.commitEdit("keyboard", event.nativeEvent, true);
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    context.cancelEdit();
                }
            },
            onBlur: (event: FocusEvent<HTMLInputElement>) =>
                context.onTagInputBlur(index, event),
        },
        (node: HTMLElement | null) => {
            element.current = node as HTMLInputElement | null;
        },
    );
}
