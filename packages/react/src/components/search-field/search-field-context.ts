import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";

/** The state every part renders with (spec/search-field.md, "API"). */
export interface SearchFieldState {
    value: string;
    empty: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface SearchFieldContextValue extends SearchFieldState {
    inputId: string;
    name: string | undefined;
    field: FieldControlBinding;
    /** The state attributes, for every part. */
    attributes: Record<`data-${string}`, string>;
    onInputText: (text: string, event: Event) => void;
    /** Escape in the Input: whether it cleared the field (and handled the key). */
    onEscape: (event: Event) => boolean;
    onEnter: () => void;
    /** The ClearButton's press. */
    clear: (event: Event) => void;
    setInputElement: (element: HTMLInputElement | null) => void;
}

export const SearchFieldContext = createContext<SearchFieldContextValue | null>(
    null,
);

export function searchFieldState(
    context: SearchFieldContextValue,
): SearchFieldState {
    return {
        value: context.value,
        empty: context.empty,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
    };
}
