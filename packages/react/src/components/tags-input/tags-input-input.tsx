import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { TagsInputContext } from "./tags-input-context.ts";

export interface TagsInputInputState {
    disabled: boolean;
    empty: boolean;
}

/** The text the next tag is typed in: the labelled control (spec/tags-input.md). */
export function TagsInputInput(props: PartProps<TagsInputInputState>) {
    const context = useRequiredContext(TagsInputContext, "TagsInput.Input");
    const { disabled, empty } = context;
    return renderElement(
        "input",
        props,
        { disabled, empty },
        {
            id: context.inputId,
            value: context.text,
            disabled,
            "aria-required": context.required ? "true" : undefined,
            ...context.fieldAria,
            "data-primitives-part": "tags-input-input",
            onChange: context.onInputChange,
            onKeyDown: context.onInputKeyDown,
            onPaste: context.onInputPaste,
        },
        context.setInput as (element: HTMLElement | null) => void,
    );
}
