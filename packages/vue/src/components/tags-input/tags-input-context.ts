import type { ComputedRef, InjectionKey, ShallowRef } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

/** The tag being edited in its TagInput, and its text. */
export interface TagsInputEdit {
    index: number;
    text: string;
}

export interface TagsInputContext {
    value: ComputedRef<readonly string[]>;
    text: ComputedRef<string>;
    disabled: () => boolean;
    required: () => boolean;
    empty: ComputedRef<boolean>;
    editing: ShallowRef<TagsInputEdit | null>;
    inputId: string;
    setInput: (element: unknown) => void;
    /** The field's ARIA, for the Input (the labelled control). */
    fieldAria: () => Record<string, string | undefined>;
    focusInput: () => void;
    onInputInput: (event: Event) => void;
    onInputKeydown: (event: KeyboardEvent) => void;
    onInputPaste: (event: ClipboardEvent) => void;
    onTagKeydown: (event: KeyboardEvent, index: number) => void;
    startEdit: (index: number) => void;
    setEditText: (text: string) => void;
    /** Ends the edit (spec/tags-input.md, "Editing a tag"); `focus`: Enter, which moves it. */
    commitEdit: (reason: ChangeReason, event: Event, focus: boolean) => void;
    cancelEdit: () => void;
    onTagInputBlur: (index: number, event: FocusEvent) => void;
    remove: (index: number, reason: ChangeReason, event: Event) => void;
    clear: (event: Event) => void;
}

export const TagsInputKey: InjectionKey<TagsInputContext> = Symbol("TagsInput");

export interface TagsInputTagContext {
    index: () => number;
    editing: () => boolean;
    disabled: () => boolean;
}

export const TagsInputTagKey: InjectionKey<TagsInputTagContext> =
    Symbol("TagsInputTag");

/** A key of a text composition (an IME), which the TagsInput leaves alone. */
export function composing(event: KeyboardEvent): boolean {
    return event.isComposing || event.keyCode === 229;
}
