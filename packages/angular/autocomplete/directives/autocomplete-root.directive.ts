import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    containsFilter,
    filterItems,
    type ItemFilter,
    itemLabel,
} from "@fragiola/primitives/collection";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createOverlayRoot,
    injectFlush,
    injectId,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** A suggestion: the consumer's own type (spec/autocomplete.md, "API"). */
// `unknown` in the declarations (no `any`): a template narrows it to its own item type
export type AutocompleteItemValue = unknown;

/** How the autocomplete completes the text (spec/autocomplete.md, "API"). */
export type AutocompleteMode = "list" | "both" | "inline" | "none";

/** `filter` over the consumer's own items (`never` for the item: see Combobox's). */
type ConsumerFilter = (
    item: never,
    query: string,
    itemToString: (item: unknown) => string,
) => boolean;

/** A rendered Item, as the Root knows it. */
export interface AutocompleteItemInfo {
    value: AutocompleteItemValue;
    disabled: boolean;
    id: string;
}

/**
 * What the keyboard highlights once the list renders: the first or last suggestion, the first one
 * after typing (`autoHighlight`), or the inline completion of the typed text.
 */
export type AutocompletePending = "first" | "last" | "complete" | null;

/** The text a highlight shows in the input (`both`, `inline`), and the suggestion it comes from. */
export interface AutocompleteShown {
    item: AutocompleteItemValue;
    text: string;
    /** Where the completion string starts: it is selected (`null`: the caret at the end). */
    selectFrom: number | null;
}

export interface AutocompleteState {
    open: boolean;
    disabled: boolean;
    /** The text. */
    value: string;
}

const NONE: readonly AutocompleteItemValue[] = [];

/**
 * Holds the autocomplete's state (spec/autocomplete.md): the value is the text.
 * `<ng-container autocompleteRoot #search="autocompleteRoot" [items]="fruits" [(value)]="text">`.
 * `value()` and `state()` are the current state, bound or its own (Angular has no Value part). The
 * overlay's `trigger` is the input, the Trigger button is `button`.
 */
@Directive({ selector: "[autocompleteRoot]", exportAs: "autocompleteRoot" })
export class AutocompleteRoot implements OverlayActions {
    /** The suggestions, or groups of them: filtered in `list` and `both`. */
    readonly items = input<readonly AutocompleteItemValue[] | undefined>(
        undefined,
    );
    /** `list` (default), `both`, `inline` or `none`. */
    readonly mode = input<AutocompleteMode>("list");
    /** Whether a suggestion matches the query; `null` turns filtering off. */
    readonly filter = input<ConsumerFilter | null | undefined>(undefined);
    /** The most suggestions the list renders; `-1` for no limit. */
    readonly limit = input(-1);
    readonly locale = input<string | undefined>(undefined);
    /** A suggestion's text, written into the input when chosen. */
    readonly itemToStringValue = input<((item: never) => string) | undefined>(
        undefined,
    );
    /** A press on the input opens the list (default `false`). */
    readonly openOnInputClick = input(false, { transform: booleanAttribute });
    /** Typing highlights the first suggestion (`list`, `none`; default `false`). */
    readonly autoHighlight = input(false, { transform: booleanAttribute });
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** The bound text (`[(value)]`); `value()` is the current one. */
    readonly boundValue = input<string | undefined>(undefined, {
        alias: "value",
    });
    readonly valueChange = output<string>();
    readonly defaultValue = input<string | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<string>>();
    readonly name = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });

    /** The input's id, once it has one: the field's label points at it. */
    readonly inputElementId = signal<string | undefined>(undefined);
    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-autocomplete",
    );
    private readonly text = controllable<string, ChangeDetails>(
        this.boundValue,
        this.valueChange,
        () => this.defaultValue() ?? "",
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The value: the typed or chosen text. */
    readonly value = this.text.value;
    /** The enclosing field's binding, for the input (spec/field.md). */
    readonly field = fieldControl({
        id: this.inputElementId,
        labelable: true,
        value: this.value,
        filled: computed(() => this.value() !== ""),
        input: () => this.overlay.trigger() as HTMLInputElement | null,
        focusTarget: () => this.overlay.trigger(),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The Input's form name: the field's, else its own. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    /** The `both` and `inline` modes complete the text inline. */
    readonly inline = computed(
        () => this.mode() === "both" || this.mode() === "inline",
    );
    /** The highlighted item's id. */
    readonly highlighted = signal<string | null>(null);
    /** The text a highlight shows instead of the value, or `null`. */
    readonly shown = signal<AutocompleteShown | null>(null);
    /** What the input shows: the highlight's text, else the value. */
    readonly displayed = computed(() => this.shown()?.text ?? this.value());
    private readonly registered = new Map<HTMLElement, AutocompleteItemInfo>();
    /** Follows the registered items, so `data-empty` and the pending highlight follow. */
    readonly itemCount = signal(0);
    readonly list = signal<HTMLElement | null>(null);
    readonly button = signal<HTMLElement | null>(null);
    readonly inputGroup = signal<HTMLElement | null>(null);
    readonly clearButton = signal<HTMLElement | null>(null);
    readonly listId = `${injectId("primitives-autocomplete")}-list`;
    /** What to highlight once the list renders. */
    readonly pending = signal<AutocompletePending>(null);
    readonly placed = placementSignal({ side: "bottom", align: "start" });
    private readonly flush = injectFlush();

    readonly state = computed<AutocompleteState>(() => ({
        open: this.overlay.open(),
        disabled: this.isDisabled(),
        value: this.value(),
    }));

    private readonly resolvedFilter = computed(() => {
        const filter = this.filter() as
            | ItemFilter<AutocompleteItemValue>
            | null
            | undefined;
        return filter === undefined
            ? containsFilter<AutocompleteItemValue>(this.locale())
            : filter;
    });
    readonly hasItems = computed(() => this.items() !== undefined);
    /** The matching entries: suggestions, or groups with their matching suggestions. */
    readonly entries = computed<readonly AutocompleteItemValue[]>(() => {
        const items = this.items();
        if (items === undefined) {
            return NONE;
        }
        const filters = this.mode() === "list" || this.mode() === "both";
        return filterItems(items, filters ? this.value().trim() : "", {
            filter: filters ? this.resolvedFilter() : null,
            limit: this.limit(),
            itemToString: (item) => this.label(item),
        });
    });
    /** Whether the list holds no suggestion. */
    readonly empty = computed(() =>
        this.hasItems() ? this.entries().length === 0 : this.itemCount() === 0,
    );

    /** A suggestion's text (`itemToStringValue`). */
    label(item: AutocompleteItemValue): string {
        return itemLabel(
            item,
            this.itemToStringValue() as
                | ((item: AutocompleteItemValue) => string)
                | undefined,
        );
    }

    /**
     * Opens or closes the list, and renders it at once; returns whether it changed. Leaving the
     * input accepts the inline completion (APG); every close drops the highlight.
     */
    setOpen(next: boolean, reason: ChangeReason, event?: Event): boolean {
        const shown = untracked(this.shown);
        const changed = this.overlay.setOpen(next, reason, event);
        if (next || !changed) {
            this.flush();
            return changed;
        }
        if (
            untracked(this.inline) &&
            shown !== null &&
            (reason === "focus-out" || reason === "outside-press")
        ) {
            this.text.set(this.label(shown.item), {
                reason: "input-blur",
                event,
            });
        }
        this.shown.set(null);
        this.highlighted.set(null);
        this.pending.set(null);
        this.flush();
        return changed;
    }

    /** Types `text` (spec/autocomplete.md, "Keyboard": typing). */
    type(text: string, addition: boolean, event: Event): void {
        this.text.set(text, { reason: "input-change", event });
        this.shown.set(null);
        this.highlighted.set(null);
        this.pending.set(null);
        const filled = text.trim() !== "";
        const open = untracked(this.overlay.open);
        if (filled && !open) {
            this.setOpen(true, "input-change", event);
        } else if (!filled && open && !this.openOnInputClick()) {
            this.setOpen(false, "input-clear", event);
            return;
        }
        if (filled) {
            if (this.inline()) {
                if (addition) {
                    this.pending.set("complete");
                }
            } else if (this.autoHighlight()) {
                this.pending.set("first");
            }
        }
        this.flush();
    }

    /** Highlights an item (or none); the keyboard's highlight shows its text inline. */
    highlight(id: string | null, from: "keyboard" | "pointer"): void {
        this.highlighted.set(id);
        if (from === "keyboard" && untracked(this.inline)) {
            const item = [...this.registered.values()].find(
                (entry) => entry.id === id,
            );
            this.shown.set(
                item === undefined
                    ? null
                    : {
                          item: item.value,
                          text: this.label(item.value),
                          selectFrom: null,
                      },
            );
        }
        this.flush();
    }

    /** Highlights a suggestion and completes the typed text with it, the rest selected (APG). */
    complete(item: AutocompleteItemInfo): void {
        const typed = untracked(this.value);
        this.highlighted.set(item.id);
        this.shown.set({
            item: item.value,
            text: this.label(item.value),
            selectFrom: typed.length,
        });
    }

    /** Chooses a suggestion: its text becomes the value, the list closes. */
    choose(item: AutocompleteItemValue, event?: Event): void {
        this.shown.set(null);
        this.highlighted.set(null);
        this.text.set(this.label(item), { reason: "item-press", event });
        this.setOpen(false, "item-press", event);
    }

    /** Empties the text. */
    clear(reason: ChangeReason, event?: Event): void {
        this.shown.set(null);
        this.highlighted.set(null);
        this.text.set("", { reason, event });
        this.flush();
    }

    /** The rendered items of the list, in order. */
    orderedItems(): AutocompleteItemInfo[] {
        const list = this.list();
        if (list === null) {
            return [];
        }
        return [...list.querySelectorAll<HTMLElement>('[role="option"]')]
            .map((element) => this.registered.get(element))
            .filter((item): item is AutocompleteItemInfo => item !== undefined);
    }

    /** Whether every option rendered in the list has registered. */
    itemsRegistered(): boolean {
        const list = this.list();
        return (
            list === null ||
            [...list.querySelectorAll<HTMLElement>('[role="option"]')].every(
                (element) => this.registered.has(element),
            )
        );
    }

    registerItem(element: HTMLElement, info: AutocompleteItemInfo): () => void {
        this.registered.set(element, info);
        this.itemCount.set(this.registered.size);
        return () => {
            this.registered.delete(element);
            this.itemCount.set(this.registered.size);
        };
    }

    /** A form reset: the default text, the list closed. */
    reset(): void {
        this.field.reset();
        this.shown.set(null);
        this.highlighted.set(null);
        this.text.set(this.defaultValue() ?? "", { reason: "none" });
        this.setOpen(false, "none");
        // the browser reset the input after the state changed: a state that did not change is
        // not written again
        const input = this.overlay.trigger();
        if (input instanceof HTMLInputElement) {
            input.value = this.displayed();
        }
    }

    /** Closes the list (reason `imperative-action`). */
    close(): void {
        this.setOpen(false, "imperative-action");
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
