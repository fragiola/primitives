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
import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    applySelection,
    createListModel,
    type ListModel,
    listKeyTarget,
    listPressSelection,
    pageTarget,
    type SelectionBehavior,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    fieldControl,
    writeFieldAria,
} from "@fragiola/primitives-angular/field";
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

export type ListboxOrientation = "horizontal" | "vertical";

/** A Listbox's value: the selected value or `null`, or with `multiple` the selected values. */
export type ListboxValue = string | null | readonly string[];

export interface ListboxRootState {
    multiple: boolean;
    disabled: boolean;
    orientation: ListboxOrientation;
}

/** A rendered Item, as the Root knows it. */
export interface ListboxItemEntry {
    element: HTMLElement;
    value: string;
    /** The text typeahead matches (`label`, else the element's text, read when needed). */
    label: string | undefined;
    disabled: boolean;
}

const NONE: readonly string[] = [];

/** The items in document order. */
function inOrder(entries: readonly ListboxItemEntry[]): ListboxItemEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The list model of the rendered items (`@fragiola/primitives/selection`). */
function modelOf(entries: readonly ListboxItemEntry[]): ListModel {
    return createListModel(
        entries.map((entry) => ({
            key: entry.value,
            textValue: entry.label ?? entry.element.textContent ?? "",
            disabled: entry.disabled,
        })),
    );
}

/**
 * A list of options for choosing one value or several (spec/listbox.md, the APG listbox): the
 * `listbox`, its roving focus, the selection models, typeahead, and the hidden form inputs it
 * appends as its last children: `<div listboxRoot [(value)]="fruit">` around its
 * `[listboxItem]`s. Inside a `[fieldRoot]`, the list is the field's control (as a RadioGroup).
 */
@Directive({
    selector: "[listboxRoot]",
    exportAs: "listboxRoot",
    host: {
        role: "listbox",
        "data-primitives-part": "listbox-root",
        "[attr.aria-orientation]": "orientation()",
        "[attr.aria-multiselectable]": "multiple() ? 'true' : null",
        "[attr.aria-required]": "required() ? 'true' : null",
        "[attr.aria-disabled]": "isDisabled() ? 'true' : null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-multiple]": "data().multiple",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-orientation]": "data().orientation",
        "(keydown)": "onKeyDown($event)",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class ListboxRoot {
    /** Several options can be selected. */
    readonly multiple = input(false, { transform: booleanAttribute });
    /** The selected value (or `null`), or with `multiple` the selected values (controlled). */
    readonly value = input<ListboxValue | undefined>(undefined);
    readonly valueChange = output<ListboxValue>();
    /** The selection at first (default `null`, or `[]` with `multiple`). */
    readonly defaultValue = input<ListboxValue | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<ListboxValue>>();
    /** The APG's selection model (default `"toggle"`, the recommended one). */
    readonly selectionBehavior = input<SelectionBehavior>("toggle");
    /** `aria-orientation`; a horizontal list moves with ArrowLeft and ArrowRight. */
    readonly orientation = input<ListboxOrientation>("vertical");
    /** The arrows wrap from the last option to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });
    /** Every option is disabled and none takes focus. */
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The form's validation fails while nothing is selected. */
    readonly required = input(false, { transform: booleanAttribute });

    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    private readonly flush = injectFlush();
    private readonly selection = controllable<ListboxValue, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue() ?? (this.multiple() ? NONE : null),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The selected values, as a list in both modes. */
    readonly selected = computed<readonly string[]>(() => {
        const value = this.selection.value();
        if (Array.isArray(value)) {
            return value;
        }
        return value === null || value === undefined ? NONE : [value as string];
    });
    private readonly entries = signal<readonly ListboxItemEntry[]>([]);
    // the items' document order, read when it is used: a keyed reorder moves the elements, not
    // the entries
    private readonly ordered = () => inOrder(this.entries());
    private readonly active = signal<HTMLElement | null>(null);
    private readonly within = signal(false);
    private anchor: string | null = null;
    private readonly typeahead = createTypeahead();
    private readonly validation: HTMLInputElement;

    /** The enclosing field's binding: the list is the field's control, with no labelable element. */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: computed(() => this.selection.value()),
        filled: computed(() => this.selected().length > 0),
        input: () => this.validation,
        element: () => this.host,
        focusTarget: () => this.tabStopElement(),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The hidden inputs' name: its Field's, which wins, or its own. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    /** The Item holding the tab stop; `null` before the items are known, or while disabled. */
    readonly tabStop = computed<HTMLElement | null>(() =>
        this.isDisabled() ? null : this.tabStopOf(this.ordered()),
    );
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    readonly highlighted = computed<HTMLElement | null>(() =>
        this.within() && !this.isDisabled() ? this.active() : null,
    );
    readonly state = computed<ListboxRootState>(() => ({
        multiple: this.multiple(),
        disabled: this.isDisabled(),
        orientation: this.orientation(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = this.host;
        writeFieldAria(this.field, host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
        // the hidden inputs are the Root's last children, as React renders them; inserted after the
        // first render, never on a server nor during a hydration (spec/README.md, "Server rendering")
        const document = host.ownerDocument;
        const validation = document.createElement("input");
        validation.setAttribute("aria-hidden", "true");
        validation.tabIndex = -1;
        validation.setAttribute("data-primitives-part", "listbox-input");
        Object.assign(validation.style, VISUALLY_HIDDEN_INPUT_STYLE);
        this.validation = validation;
        const hidden: HTMLInputElement[] = [];
        const destroyRef = inject(DestroyRef);
        let mounted = false;
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            mounted = true;
            host.appendChild(validation);
            stop = bridgeForm(validation, {
                reset: () => {
                    this.field.reset();
                    this.anchor = null;
                    this.selection.set(
                        untracked(this.defaultValue) ??
                            (untracked(this.multiple) ? NONE : null),
                        { reason: "none" },
                    );
                },
                invalid: () => this.tabStopElement(),
            });
            this.writeInputs(hidden);
        });
        afterRenderEffect({
            write: () => {
                this.selected();
                this.formName();
                this.isDisabled();
                this.required();
                this.multiple();
                if (mounted) {
                    untracked(() => this.writeInputs(hidden));
                }
            },
        });
        destroyRef.onDestroy(() => {
            stop?.();
            validation.remove();
            for (const input of hidden) {
                input.remove();
            }
        });
    }

    /** Writes the hidden inputs from the state: the validation input, then one per value (`multiple`). */
    private writeInputs(hidden: HTMLInputElement[]): void {
        const validation = this.validation;
        const multiple = this.multiple();
        const selected = this.selected();
        const name = this.formName();
        const disabled = this.isDisabled();
        const required = this.required();
        if (multiple || name === undefined) {
            validation.removeAttribute("name");
        } else {
            validation.setAttribute("name", name);
        }
        validation.value = multiple ? "" : (selected[0] ?? "");
        validation.required = multiple
            ? required && selected.length === 0
            : required;
        validation.disabled = disabled;
        const values = multiple && name !== undefined ? selected : NONE;
        while (hidden.length > values.length) {
            hidden.pop()?.remove();
        }
        while (hidden.length < values.length) {
            const input = this.host.ownerDocument.createElement("input");
            input.type = "hidden";
            input.setAttribute("data-primitives-part", "listbox-input");
            hidden.push(input);
        }
        let previous: Node = validation;
        for (const [index, input] of hidden.entries()) {
            input.name = name ?? "";
            input.value = values[index] ?? "";
            input.disabled = disabled;
            if (previous.nextSibling !== input) {
                this.host.insertBefore(input, previous.nextSibling);
            }
            previous = input;
        }
    }

    private tabStopOf(items: readonly ListboxItemEntry[]): HTMLElement | null {
        if (items.length === 0) {
            return null;
        }
        const active = this.active();
        if (this.within() && active !== null) {
            const focused = items.find((entry) => entry.element === active);
            if (focused !== undefined) {
                return focused.element;
            }
        }
        const selected = this.selected();
        return (
            items.find((entry) => selected.includes(entry.value))?.element ??
            items[0]?.element ??
            null
        );
    }

    /** The list's tab stop's element, where a failed validation sends the focus. */
    tabStopElement(): HTMLElement | null {
        return untracked(() => this.tabStopOf(this.ordered()));
    }

    private commit(
        change: SelectionChange | null,
        reason: ChangeReason,
        event?: Event,
    ): void {
        if (change === null) {
            return;
        }
        const current = untracked(this.selected);
        const multiple = untracked(this.multiple);
        const next = applySelection(
            modelOf(untracked(this.ordered)),
            { selected: current, anchor: this.anchor },
            change,
            {
                mode: multiple ? "multiple" : "single",
                behavior: untracked(this.selectionBehavior),
            },
        );
        this.anchor = next.anchor;
        if (sameSelection(next.selected, current)) {
            return;
        }
        this.selection.set(
            multiple ? [...next.selected] : (next.selected[0] ?? null),
            { reason, event },
        );
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (untracked(this.isDisabled) || event.defaultPrevented) {
            return;
        }
        const items = untracked(this.ordered);
        const index = items.findIndex(
            (entry) => entry.element === event.target,
        );
        if (index === -1) {
            return;
        }
        const model = modelOf(items);
        const elements = items.map((entry) => entry.element);
        const orientation = untracked(this.orientation);
        const result = listKeyTarget(event, model, index, {
            orientation,
            rtl: getDirection(this.host, this.direction()) === "rtl",
            loop: untracked(this.loopFocus),
            mode: untracked(this.multiple) ? "multiple" : "single",
            behavior: untracked(this.selectionBehavior),
            page: (from, delta) =>
                pageTarget(elements, from, delta, this.host, orientation),
            typeahead: (character, from) =>
                this.typeahead.match(character, model.labels, from),
        });
        if (result === null) {
            return;
        }
        event.preventDefault();
        elements[result.index]?.focus();
        this.commit(result.selection, "keyboard", event);
        // the new tab stop and selection reach the DOM before the next key (AGENTS.md, "Porting")
        this.flush();
    }

    /** The focus left the list: the next Tab in lands on the selection (APG). */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        this.within.set(false);
        this.typeahead.reset();
        this.field.blurred();
    }

    /** Registers an Item for as long as it lives; returns its unregistration. */
    register(entry: ListboxItemEntry): () => void {
        this.entries.update((current) => [...current, entry]);
        return () =>
            this.entries.update((current) =>
                current.filter((item) => item !== entry),
            );
    }

    /** An Item took focus. */
    focused(element: HTMLElement): void {
        this.active.set(element);
        this.within.set(true);
    }

    /** A press on an Item, with its modifiers (spec/listbox.md, "Pointer"). */
    press(element: HTMLElement, event: MouseEvent): void {
        const entry = untracked(this.ordered).find(
            (candidate) => candidate.element === element,
        );
        if (entry === undefined || untracked(this.isDisabled)) {
            return;
        }
        element.focus();
        this.commit(
            listPressSelection(entry.value, event, {
                mode: untracked(this.multiple) ? "multiple" : "single",
                behavior: untracked(this.selectionBehavior),
            }),
            "item-press",
            event,
        );
        this.flush();
    }
}
