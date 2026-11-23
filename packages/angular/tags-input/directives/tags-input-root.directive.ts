import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    tagsInputInputKeyTarget,
    tagsInputTagKeyTarget,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    editTag,
    type RefusedTag,
    type TagRefusal,
    type TagRules,
    takeTags,
    typesDelimiter,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectFlush,
    injectHost,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import { composing } from "../utils/composing.ts";

/** What `(valueInvalid)` reports: why the text was refused (spec/tags-input.md, "API"). */
export interface TagsInputInvalidDetails extends ChangeDetails {
    cause: TagRefusal;
}

/** What `(valueInvalid)` emits: the refused text and why. */
export interface TagsInputInvalidEvent {
    value: string;
    details: TagsInputInvalidDetails;
}

export interface TagsInputRootState {
    disabled: boolean;
    empty: boolean;
}

/** The tag being edited in its TagInput, and its text. */
export interface TagsInputEdit {
    index: number;
    text: string;
}

const NONE: readonly string[] = [];
const TAG_SELECTOR = '[data-primitives-part="tags-input-tag"]';
const HIDDEN_PART = "tags-input-hidden-input";

/**
 * A text input that turns what is typed into tags (spec/tags-input.md): adding, removing and
 * editing tags, their keys and focus, the hidden form inputs (appended as its last children) and
 * the Field binding. The consumer renders one `[tagsInputTag]` per value, from `tags()`:
 * `<div tagsInputRoot #root="tagsInputRoot" [defaultValue]="['react']"><div tagsInputControl>
 * @for (tag of root.tags(); track $index) { <div tagsInputTag [index]="$index">...</div> }
 * <input tagsInputInput id="tags" /></div></div>`.
 */
@Directive({
    selector: "[tagsInputRoot]",
    exportAs: "tagsInputRoot",
    host: {
        "data-primitives-part": "tags-input-root",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-empty]": "data().empty",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class TagsInputRoot {
    /** The tags, in order (controlled, `[(value)]`); `tags()` is the current list. */
    readonly value = input<readonly string[] | undefined>(undefined);
    readonly valueChange = output<readonly string[]>();
    readonly defaultValue = input<readonly string[] | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<readonly string[]>>();
    /** The Input's text (controlled, `[(inputValue)]`); `text()` is the current one. */
    readonly inputValue = input<string | undefined>(undefined);
    readonly inputValueChange = output<string>();
    readonly defaultInputValue = input<string | undefined>(undefined);
    readonly inputValueChangeDetails = output<ValueChangeEvent<string>>();
    /** A text was refused as a tag: a duplicate, past `max`, or refused by `validate`. */
    readonly valueInvalid = output<TagsInputInvalidEvent>();
    /** Ends a tag while typing and splits a paste (default `","`); `null` for none. */
    readonly delimiter = input<string | null>(",");
    /** The most tags (default `Infinity`). */
    readonly max = input(Number.POSITIVE_INFINITY);
    /** A text equal to a tag is accepted (default `false`). */
    readonly allowDuplicates = input(false, { transform: booleanAttribute });
    /** `false` refuses a trimmed text; `value` is the tags it would join. */
    readonly validate = input<
        ((tag: string, value: readonly string[]) => boolean) | undefined
    >(undefined);
    /** Leaving the TagsInput adds the text as tags, or clears it (default: it stays). */
    readonly blurBehavior = input<"add" | "clear" | undefined>(undefined);
    /** Enter and a double press on a Tag edit it in its TagInput (default `false`). */
    readonly editable = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The form's validation fails while there is no tag. */
    readonly required = input(false, { transform: booleanAttribute });

    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    private readonly flush = injectFlush();
    private readonly selection = controllable<readonly string[], ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue() ?? NONE,
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    private readonly typed = controllable<string, ChangeDetails>(
        this.inputValue,
        this.inputValueChange,
        () => this.defaultInputValue() ?? "",
        (value, details) =>
            this.inputValueChangeDetails.emit({ value, details }),
    );
    /** The tags, in order: the consumer renders one Tag per entry. */
    readonly tags = computed(() => this.selection.value());
    /** The Input's text. */
    readonly text = computed(() => this.typed.value());
    /** The tag being edited, and its text. */
    readonly editing = signal<TagsInputEdit | null>(null);
    /** The Input, registered by `[tagsInputInput]`, and its id. */
    readonly input = signal<HTMLInputElement | null>(null);
    readonly inputId = signal<string | undefined>(undefined);
    private readonly validation: HTMLInputElement;

    /** Inside a `[fieldRoot]`, the Input is the labelable control (spec/tags-input.md, "Forms"). */
    readonly field = fieldControl({
        id: this.inputId,
        labelable: true,
        value: this.tags,
        filled: computed(() => this.tags().length > 0),
        input: () => this.validation,
        focusTarget: () => untracked(this.input),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The hidden inputs' name: its Field's, which wins, or its own. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    readonly empty = computed(() => this.tags().length === 0);
    readonly state = computed<TagsInputRootState>(() => ({
        disabled: this.isDisabled(),
        empty: this.empty(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = this.host;
        // the hidden inputs are the Root's last children, as React renders them; inserted after the
        // first render, never on a server nor during a hydration (spec/README.md, "Server rendering")
        const validation = host.ownerDocument.createElement("input");
        validation.setAttribute("aria-hidden", "true");
        validation.tabIndex = -1;
        validation.value = "";
        validation.setAttribute("data-primitives-part", HIDDEN_PART);
        Object.assign(validation.style, VISUALLY_HIDDEN_INPUT_STYLE);
        this.validation = validation;
        const hidden: HTMLInputElement[] = [];
        let mounted = false;
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            mounted = true;
            host.appendChild(validation);
            stop = bridgeForm(validation, {
                reset: () => {
                    this.field.reset();
                    this.editing.set(null);
                    this.selection.set(untracked(this.defaultValue) ?? NONE, {
                        reason: "none",
                    });
                    this.typed.set(untracked(this.defaultInputValue) ?? "", {
                        reason: "none",
                    });
                },
                invalid: () => untracked(this.input),
            });
            this.writeInputs(hidden);
        });
        afterRenderEffect({
            write: () => {
                this.tags();
                this.formName();
                this.isDisabled();
                this.required();
                if (mounted) {
                    untracked(() => this.writeInputs(hidden));
                }
            },
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            validation.remove();
            for (const element of hidden) {
                element.remove();
            }
        });
    }

    /** Writes the hidden inputs: the validation input, then one `type="hidden"` per tag (named). */
    private writeInputs(hidden: HTMLInputElement[]): void {
        const validation = this.validation;
        const tags = this.tags();
        const name = this.formName();
        const disabled = this.isDisabled();
        validation.required = this.required() && tags.length === 0;
        validation.disabled = disabled;
        const values = name === undefined ? NONE : tags;
        while (hidden.length > values.length) {
            hidden.pop()?.remove();
        }
        while (hidden.length < values.length) {
            const element = this.host.ownerDocument.createElement("input");
            element.type = "hidden";
            element.setAttribute("data-primitives-part", HIDDEN_PART);
            hidden.push(element);
        }
        let previous: Node = validation;
        for (const [index, element] of hidden.entries()) {
            element.name = name ?? "";
            element.value = values[index] ?? "";
            element.disabled = disabled;
            if (previous.nextSibling !== element) {
                this.host.insertBefore(element, previous.nextSibling);
            }
            previous = element;
        }
    }

    private rules(): TagRules {
        return untracked(() => ({
            delimiter: this.delimiter(),
            max: this.max(),
            allowDuplicates: this.allowDuplicates(),
            validate: this.validate(),
        }));
    }

    /** The rendered Tags, in order. */
    private tagElements(): HTMLElement[] {
        return [...this.host.querySelectorAll<HTMLElement>(TAG_SELECTOR)];
    }

    /** Focuses the Input. */
    focusInput(): void {
        untracked(this.input)?.focus();
    }

    private focusTag(target: number | "input"): void {
        if (target === "input") {
            this.focusInput();
        } else {
            this.tagElements()[target]?.focus();
        }
    }

    /** Puts the accepted text back on the Input when the binding did not change it. */
    private reassert(): void {
        this.flush();
        const element = untracked(this.input);
        const text = untracked(this.text);
        if (element !== null && element.value !== text) {
            element.value = text;
        }
    }

    private refuse(
        refused: readonly RefusedTag[],
        reason: ChangeReason,
        event: Event | undefined,
    ): void {
        for (const entry of refused) {
            this.valueInvalid.emit({
                value: entry.text,
                details: { reason, event, cause: entry.cause },
            });
        }
    }

    /** Offers `offered` as tags (spec/tags-input.md, "Adding tags"). */
    private offer(
        offered: string,
        whole: boolean,
        reason: ChangeReason,
        event: Event | undefined,
    ): void {
        const taken = takeTags(
            untracked(this.tags),
            offered,
            this.rules(),
            whole,
        );
        if (taken.added.length > 0) {
            this.selection.set([...taken.value], { reason, event });
        }
        this.refuse(taken.refused, reason, event);
        this.typed.set(taken.text, { reason, event });
    }

    /**
     * The Input's text changed; a typed delimiter ends the tags before it. Only an input that
     * typed the delimiter offers the text: a refused text left in the Input is not offered again
     * on every keystroke (spec/tags-input.md, "Adding tags").
     */
    inputChanged(event: Event): void {
        const next = (event.target as HTMLInputElement).value;
        if (
            typesDelimiter(
                untracked(this.text),
                next,
                untracked(this.delimiter),
                (event as Partial<InputEvent>).data ?? null,
            )
        ) {
            this.offer(next, false, "input-change", event);
        } else {
            this.typed.set(next, { reason: "input-change", event });
        }
        this.reassert();
    }

    /** A paste holding the delimiter is offered whole, in place of the selection. */
    inputPasted(event: ClipboardEvent): void {
        const pasted = event.clipboardData?.getData("text") ?? "";
        const delimiter = untracked(this.delimiter);
        // a paste without the delimiter is an ordinary paste
        if (
            delimiter === null ||
            delimiter === "" ||
            !pasted.includes(delimiter)
        ) {
            return;
        }
        event.preventDefault();
        const target = event.target as HTMLInputElement;
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? start;
        this.offer(
            target.value.slice(0, start) + pasted + target.value.slice(end),
            true,
            "input-paste",
            event,
        );
        this.reassert();
    }

    /** A key in the Input (spec/tags-input.md, "Keyboard"). */
    inputKeyDown(event: KeyboardEvent): void {
        if (event.defaultPrevented || composing(event)) {
            return;
        }
        const target = event.target as HTMLInputElement;
        const action = tagsInputInputKeyTarget(
            event,
            target,
            untracked(this.tags).length,
            getDirection(target, this.direction()) === "rtl",
        );
        if (action === null) {
            return;
        }
        if (action.type === "add") {
            // an empty text leaves Enter to the form, which submits
            if (target.value.trim() === "") {
                return;
            }
            event.preventDefault();
            this.offer(target.value, true, "keyboard", event);
            this.reassert();
            return;
        }
        event.preventDefault();
        this.focusTag(action.index);
    }

    /** Removes the tag at `index`, rendered at once. */
    removeAt(index: number, reason: ChangeReason, event: Event): void {
        const current = untracked(this.tags);
        if (index < 0 || index >= current.length) {
            return;
        }
        // an edit follows its tag: a removal before it moves it down, its own ends it
        // (spec/tags-input.md, "Editing a tag")
        const edit = untracked(this.editing);
        if (edit !== null && edit.index >= index) {
            this.editing.set(
                edit.index === index
                    ? null
                    : { index: edit.index - 1, text: edit.text },
            );
        }
        this.selection.set(
            current.filter((_, position) => position !== index),
            { reason, event },
        );
        this.flush();
    }

    /** Starts editing the tag at `index` (`editable`); a double press inside its edit keeps it. */
    startEdit(index: number): void {
        const current = untracked(this.tags)[index];
        if (
            !untracked(this.editable) ||
            untracked(this.isDisabled) ||
            current === undefined ||
            untracked(this.editing)?.index === index
        ) {
            return;
        }
        this.editing.set({ index, text: current });
        // the TagInput takes the focus before the next key
        this.flush();
    }

    /** A key on a focused Tag (spec/tags-input.md, "Keyboard"). */
    tagKeyDown(event: KeyboardEvent, index: number): void {
        if (
            event.defaultPrevented ||
            event.target !== event.currentTarget ||
            composing(event)
        ) {
            return;
        }
        const element = event.currentTarget as HTMLElement;
        const action = tagsInputTagKeyTarget(
            event,
            index,
            untracked(this.tags).length,
            {
                rtl: getDirection(element, this.direction()) === "rtl",
                editable: untracked(this.editable),
            },
        );
        if (action === null) {
            return;
        }
        if (action.type === "type") {
            // the character goes on to the Input
            this.focusInput();
            return;
        }
        event.preventDefault();
        if (action.type === "focus") {
            this.focusTag(action.target);
        } else if (action.type === "remove") {
            this.removeAt(index, "keyboard", event);
            this.focusTag(action.focus);
        } else {
            this.startEdit(index);
        }
    }

    /** The TagInput's text. */
    setEditText(text: string): void {
        const current = untracked(this.editing);
        if (current !== null) {
            this.editing.set({ index: current.index, text });
        }
    }

    /** Ends the edit (spec/tags-input.md, "Editing a tag"); `focus`: Enter, which moves it. */
    commitEdit(reason: ChangeReason, event: Event, focus: boolean): void {
        const edit = untracked(this.editing);
        if (edit === null) {
            return;
        }
        const result = editTag(
            untracked(this.tags),
            edit.index,
            edit.text,
            this.rules(),
        );
        if (result.type === "refused") {
            this.refuse([result], reason, event);
            // leaving it drops a refused edit; Enter goes on editing
            if (!focus) {
                this.editing.set(null);
            }
            return;
        }
        // ended before the render that hides the TagInput, whose blur then ends nothing
        this.editing.set(null);
        if (result.type !== "unchanged") {
            this.selection.set([...result.value], { reason, event });
        }
        if (!focus) {
            return;
        }
        this.flush();
        if (result.type === "removed") {
            // as Delete: the tag now at its place, else the previous one, else the Input
            const left = result.value.length;
            this.focusTag(
                edit.index < left ? edit.index : left > 0 ? left - 1 : "input",
            );
        } else {
            this.focusTag(edit.index);
        }
    }

    /** Escape drops the edit; the Tag is focused. */
    cancelEdit(): void {
        const edit = untracked(this.editing);
        if (edit === null) {
            return;
        }
        this.editing.set(null);
        this.flush();
        this.focusTag(edit.index);
    }

    /** The TagInput of the tag at `index` lost the focus: its edit ends. */
    tagInputBlurred(index: number, event: FocusEvent): void {
        if (untracked(this.editing)?.index === index) {
            this.commitEdit("input-blur", event, false);
        }
    }

    /** Removes every tag and the text, and focuses the Input. */
    clear(event: Event): void {
        this.editing.set(null);
        if (untracked(this.tags).length > 0) {
            this.selection.set([], { reason: "clear-press", event });
        }
        if (untracked(this.text) !== "") {
            this.typed.set("", { reason: "clear-press", event });
        }
        this.flush();
        this.focusInput();
    }

    /** Leaving the TagsInput (spec/tags-input.md, "API": `blurBehavior`). */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        const behavior = untracked(this.blurBehavior);
        const current = untracked(this.text);
        if (behavior === "add" && current.trim() !== "") {
            this.offer(current, true, "input-blur", event);
        } else if (behavior === "clear" && current !== "") {
            this.typed.set("", { reason: "input-blur", event });
        }
        this.field.blurred();
    }
}
