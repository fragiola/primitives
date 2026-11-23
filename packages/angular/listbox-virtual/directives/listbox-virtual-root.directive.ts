import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    forwardRef,
    inject,
    input,
    numberAttribute,
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
    listKeyTarget,
    listPressSelection,
    type SelectionBehavior,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import { createVirtualizer } from "@fragiola/primitives/virtual";
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
    injectVirtualRows,
    type ValueChangeEvent,
    type VirtualItemSize,
    type VirtualRowData,
} from "@fragiola/primitives-angular/internal";
import {
    type ListboxItemEntry,
    ListboxRoot,
    type ListboxRootState,
    type ListboxValue,
} from "@fragiola/primitives-angular/listbox";

/** One option of a virtual Listbox: its value, the label typeahead matches, its disabled state. */
export interface ListboxVirtualItem {
    value: string;
    label: string;
    disabled?: boolean;
}

const NONE: readonly string[] = [];
/** A virtual list is vertical (spec/virtual-lists.md). */
const orientation = "vertical" as const;

/**
 * A Listbox Root over `items`, rendering only the options in view (spec/virtual-lists.md): the
 * keys, the typeahead, the ranges and select all run over every item, a key scrolls its target
 * into view, renders it within the event and focuses it, and the focused option and the tab stop
 * stay rendered. Its template renders `rows()` (`exportAs`), each a `[listboxItem]` with the
 * `[listboxVirtualRow]` bound to its row:
 * `<div listboxVirtualRoot #list="listboxVirtualRoot" [items]="items">` around
 * `@for (row of list.rows(); track row.index) { <div listboxItem [listboxVirtualRow]="row" [value]="row.item.value">...</div> }`.
 * It is the Items' Listbox Root (it provides `ListboxRoot`).
 */
@Directive({
    selector: "[listboxVirtualRoot]",
    exportAs: "listboxVirtualRoot",
    providers: [
        {
            provide: ListboxRoot,
            useExisting: forwardRef(() => ListboxVirtualRoot),
        },
    ],
    host: {
        role: "listbox",
        "data-primitives-part": "listbox-root",
        "aria-orientation": "vertical",
        "[attr.aria-multiselectable]": "multiple() ? 'true' : null",
        "[attr.aria-required]": "required() ? 'true' : null",
        "[attr.aria-disabled]": "isDisabled() ? 'true' : null",
        "[attr.aria-busy]": "loading() ? 'true' : null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-multiple]": "data().multiple",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-loading]": "data().loading",
        "(keydown)": "onKeyDown($event)",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class ListboxVirtualRoot {
    /** Every option, in the list's order. */
    readonly items = input.required<readonly ListboxVirtualItem[]>();
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
    /** The arrows wrap from the last option to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });
    /** Every option is disabled and none takes focus. */
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The form's validation fails while nothing is selected. */
    readonly required = input(false, { transform: booleanAttribute });
    /** A row's size in pixels before it is measured, or every row's with `measure` false. */
    readonly itemSize = input<VirtualItemSize>(36);
    /** Measure the rendered rows (default `true`); `false`: fixed sizes. */
    readonly measure = input(true, { transform: booleanAttribute });
    /** The rows rendered beyond each end of the view (default 4). */
    readonly overscan = input(4, { transform: numberAttribute });
    /** The list is loading (`data-loading`, `aria-busy`). */
    readonly loading = input(false, { transform: booleanAttribute });
    /** The last row came into view while not `loading`: load the next page. */
    readonly loadMore = output<void>();

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
    private readonly focusedValue = signal<string | null>(null);
    private readonly within = signal(false);
    private anchor: string | null = null;
    private readonly typeahead = createTypeahead();
    private readonly validation: HTMLInputElement;
    private readonly indexOf = computed(
        () => new Map(this.items().map((item, index) => [item.value, index])),
    );
    /** The list model of every item (`@fragiola/primitives/selection`). */
    private readonly model = computed(() =>
        createListModel(
            this.items().map((item) => ({
                key: item.value,
                textValue: item.label,
                disabled: item.disabled === true,
            })),
        ),
    );
    // the tab stop: the focused option while the focus is inside, else the first selected, else
    // the first (APG)
    private readonly tabStopValue = computed<string | null>(() => {
        const focused = this.focusedValue();
        if (this.within() && focused !== null && this.indexOf().has(focused)) {
            return focused;
        }
        const selected = this.selected();
        const items = this.items();
        return (
            items.find((item) => selected.includes(item.value))?.value ??
            items[0]?.value ??
            null
        );
    });
    /** The virtualizer and its rows, for the row directive. */
    readonly virtual = injectVirtualRows({
        createVirtualizer,
        host: this.host,
        items: () => this.items(),
        pinned: () =>
            [this.tabStopValue(), this.focusedValue()].flatMap((key) =>
                key === null ? [] : [this.indexOf().get(key) ?? -1],
            ),
        itemSize: this.itemSize,
        measure: this.measure,
        overscan: this.overscan,
        loading: this.loading,
        loadMore: () => this.loadMore.emit(),
    });
    /** The rows to render: `@for (row of list.rows(); track row.index)`. */
    readonly rows: () => readonly VirtualRowData<ListboxVirtualItem>[] =
        this.virtual.rows;

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
    /** The Item holding the tab stop; `null` before it renders, or while disabled. */
    readonly tabStop = computed<HTMLElement | null>(() =>
        this.isDisabled() ? null : this.elementOf(this.tabStopValue()),
    );
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    readonly highlighted = computed<HTMLElement | null>(() =>
        this.within() && !this.isDisabled()
            ? this.elementOf(this.focusedValue())
            : null,
    );
    readonly state = computed<ListboxRootState>(() => ({
        multiple: this.multiple(),
        disabled: this.isDisabled(),
        orientation,
    }));
    protected readonly data = computed(() =>
        dataValues({ ...this.state(), loading: this.loading() }),
    );

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

    /** The rendered Item of a value, or `null`. */
    private elementOf(key: string | null): HTMLElement | null {
        if (key === null) {
            return null;
        }
        return (
            this.entries().find((entry) => entry.value === key)?.element ?? null
        );
    }

    /** The list's tab stop's element, where a failed validation sends the focus. */
    tabStopElement(): HTMLElement | null {
        return untracked(() => this.elementOf(this.tabStopValue()));
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
            untracked(this.model),
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
        const entry = untracked(this.entries).find(
            (candidate) => candidate.element === event.target,
        );
        const index =
            entry === undefined
                ? -1
                : (untracked(this.indexOf).get(entry.value) ?? -1);
        if (index === -1) {
            return;
        }
        const model = untracked(this.model);
        const virtualizer = this.virtual.virtualizer;
        const result = listKeyTarget(event, model, index, {
            orientation,
            rtl: getDirection(this.host, this.direction()) === "rtl",
            loop: untracked(this.loopFocus),
            mode: untracked(this.multiple) ? "multiple" : "single",
            behavior: untracked(this.selectionBehavior),
            page: (from, delta) => virtualizer.pageIndex(from, delta),
            typeahead: (character, from) =>
                this.typeahead.match(character, model.labels, from),
        });
        if (result === null) {
            return;
        }
        event.preventDefault();
        const target = untracked(this.items)[result.index];
        if (target !== undefined) {
            // the target renders within the event, in view, then takes the focus (AGENTS.md,
            // "Porting": a key that moves focus renders before the next key)
            this.focusedValue.set(target.value);
            virtualizer.scrollToIndex(result.index);
            this.flush();
            this.host
                .querySelector<HTMLElement>(`[data-index="${result.index}"]`)
                ?.focus();
        }
        this.commit(result.selection, "keyboard", event);
        // the new tab stop and selection reach the DOM before the next key
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
        const entry = untracked(this.entries).find(
            (candidate) => candidate.element === element,
        );
        if (entry !== undefined) {
            this.focusedValue.set(entry.value);
        }
        this.within.set(true);
    }

    /** A press on an Item, with its modifiers (spec/listbox.md, "Pointer"). */
    press(element: HTMLElement, event: MouseEvent): void {
        const entry = untracked(this.entries).find(
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
