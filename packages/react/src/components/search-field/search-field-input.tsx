import type { ChangeEvent, KeyboardEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    SearchFieldContext,
    type SearchFieldState,
    searchFieldState,
} from "./search-field-context.ts";

export type SearchFieldInputProps = PartProps<SearchFieldState>;

/** The `searchbox`: Escape clears it, Enter submits it (spec/search-field.md, "Keyboard"). */
export function SearchFieldInput(props: SearchFieldInputProps) {
    const context = useRequiredContext(SearchFieldContext, "SearchField.Input");
    const { field } = context;
    return renderElement(
        "input",
        props,
        searchFieldState(context),
        {
            id: context.inputId,
            type: "search",
            name: context.name,
            value: context.value,
            disabled: context.disabled,
            readOnly: context.readOnly,
            required: context.required,
            ...field.aria,
            "data-primitives-part": "search-field-input",
            ...context.attributes,
            ...field.attributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
                context.onInputText(
                    event.currentTarget.value,
                    event.nativeEvent,
                ),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.nativeEvent.isComposing) {
                    return;
                }
                if (event.key === "Escape") {
                    if (context.onEscape(event.nativeEvent)) {
                        event.preventDefault();
                    }
                } else if (event.key === "Enter") {
                    context.onEnter();
                }
            },
            onFocus: field.onFocus,
            onBlur: field.onBlur,
        },
        (element: HTMLElement | null) =>
            context.setInputElement(element as HTMLInputElement | null),
    );
}
