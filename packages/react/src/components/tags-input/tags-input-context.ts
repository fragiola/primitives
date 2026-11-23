import type {
    ClipboardEvent,
    FocusEvent,
    FormEvent,
    KeyboardEvent,
} from "react";
import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

/** The tag being edited in its TagInput, and its text. */
export interface TagsInputEdit {
    index: number;
    text: string;
}

export interface TagsInputContextValue {
    value: readonly string[];
    text: string;
    disabled: boolean;
    required: boolean;
    empty: boolean;
    editing: TagsInputEdit | null;
    inputId: string;
    setInput: (element: HTMLInputElement | null) => void;
    /** The field's ARIA, for the Input (the labelled control). */
    fieldAria: Record<string, string | undefined>;
    focusInput: () => void;
    onInputChange: (event: FormEvent<HTMLInputElement>) => void;
    onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onInputPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
    onTagKeyDown: (event: KeyboardEvent<HTMLElement>, index: number) => void;
    startEdit: (index: number) => void;
    setEditText: (text: string) => void;
    /** Ends the edit (spec/tags-input.md, "Editing a tag"); `focus`: Enter, which moves it. */
    commitEdit: (reason: ChangeReason, event: Event, focus: boolean) => void;
    cancelEdit: () => void;
    onTagInputBlur: (
        index: number,
        event: FocusEvent<HTMLInputElement>,
    ) => void;
    remove: (index: number, reason: ChangeReason, event: Event) => void;
    clear: (event: Event) => void;
}

export const TagsInputContext = createContext<TagsInputContextValue | null>(
    null,
);

export interface TagsInputTagContextValue {
    index: number;
    editing: boolean;
    disabled: boolean;
}

export const TagsInputTagContext =
    createContext<TagsInputTagContextValue | null>(null);
