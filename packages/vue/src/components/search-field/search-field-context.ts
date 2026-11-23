import type { ComputedRef, InjectionKey } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";

/** The state every part renders with (spec/search-field.md, "API"). */
export interface SearchFieldState {
    value: string;
    empty: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface SearchFieldContext {
    state: ComputedRef<SearchFieldState>;
    inputId: () => string;
    name: () => string | undefined;
    field: FieldControlBinding;
    /** The state attributes, for every part. */
    attributes: ComputedRef<Record<string, string>>;
    onInputText: (text: string, event: Event) => void;
    /** Escape in the Input: whether it cleared the field (and handled the key). */
    onEscape: (event: Event) => boolean;
    onEnter: () => void;
    /** The ClearButton's press. */
    clear: (event: Event) => void;
    setInput: (element: unknown) => void;
}

export const SearchFieldKey: InjectionKey<SearchFieldContext> =
    Symbol("SearchField");
