import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    effect,
    inject,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createHiddenInput,
    createOverlayRoot,
    injectId,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
    setInputAttribute,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** One item of the Root's `items` (spec/select.md, "API"). */
export interface SelectItemData {
    value: string;
    label: string;
    disabled?: boolean;
}

/** An Item that registered itself (a Select without `items`: spec/select.md, "API"). */
export interface RegisteredItem extends SelectItemData {
    element: HTMLElement;
}

export interface SelectState {
    open: boolean;
    disabled: boolean;
    value: string | null;
}

/** The item to highlight when the list opens: the selected one, else the first enabled one. */
export function initialHighlight(
    items: readonly SelectItemData[],
    value: string | null,
): string | null {
    if (value !== null && items.some((item) => item.value === value)) {
        return value;
    }
    return items.find((item) => !item.disabled)?.value ?? null;
}

/**
 * Holds the select's state and renders its hidden form input (spec/select.md):
 * `<ng-container selectRoot [items]="items" [(value)]="value" name="fruit">`. With `items`, the
 * Value's label and the typeahead on the closed trigger know the labels while the list is not
 * rendered; without it, the `[selectItem]`s register themselves while they are rendered (keep
 * the list mounted: `*selectPortal="{ keepMounted: true }"`).
 */
@Directive({ selector: "[selectRoot]", exportAs: "selectRoot" })
export class SelectRoot implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    readonly value = input<string | null | undefined>(undefined);
    readonly valueChange = output<string | null>();
    readonly defaultValue = input<string | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<string | null>>();
    /**
     * Every item: the labels known while the list is closed. Without it, the Items register
     * themselves while rendered.
     */
    readonly items = input<readonly SelectItemData[] | undefined>(undefined);
    readonly name = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    /**
     * Locks the page's scroll and blocks the pointer outside while open (default `false`: the APG
     * select-only combobox is non-modal; spec/select.md, "Modal").
     */
    readonly modal = input(false, { transform: booleanAttribute });

    /** The trigger's id, once it has one: the field's label points at it. */
    readonly triggerElementId = signal<string | undefined>(undefined);
    private readonly hidden = createHiddenInput(
        inject(ElementRef).nativeElement,
        {
            "data-primitives-part": "select-input",
        },
    );
    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-select",
    );
    private readonly selection = controllable<string | null, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    readonly selected = this.selection.value;
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    readonly field = fieldControl({
        id: this.triggerElementId,
        labelable: true,
        value: this.selected,
        filled: computed(() => this.selected() !== null),
        input: () => this.hidden,
        focusTarget: () => this.overlay.trigger(),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    // without `items`, the Items register themselves (Base UI), in DOM order
    private readonly registered = signal<readonly RegisteredItem[]>([]);
    /** The Root's `items`, else the registered Items, in DOM order. */
    readonly itemList = computed(
        (): readonly SelectItemData[] => this.items() ?? this.registered(),
    );
    readonly highlighted = signal<string | null>(null);
    readonly listId = `${injectId("primitives-select")}-list`;
    readonly placed = placementSignal({ side: "bottom", align: "start" });
    readonly state = computed<SelectState>(() => ({
        open: this.overlay.open(),
        disabled: this.isDisabled(),
        value: this.selected(),
    }));

    constructor() {
        const hidden = this.hidden;
        effect(() => {
            hidden.value = this.selected() ?? "";
            setInputAttribute(
                hidden,
                "name",
                this.field.name() ?? this.name() ?? null,
            );
            hidden.required = this.required();
            hidden.disabled = this.isDisabled();
        });
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    const fallback = this.defaultValue();
                    this.field.reset();
                    this.selection.set(fallback, { reason: "none" });
                    // a value that did not change does not re-run the effect
                    hidden.value = fallback ?? "";
                },
                invalid: () => this.overlay.trigger(),
            });
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    /** Registers an Item rendered without the Root's `items`; returns its unregistration. */
    registerItem(item: RegisteredItem): () => void {
        this.registered.update((previous) =>
            [
                ...previous.filter((entry) => entry.element !== item.element),
                item,
            ].sort((a, b) =>
                a.element.compareDocumentPosition(b.element) &
                Node.DOCUMENT_POSITION_FOLLOWING
                    ? -1
                    : 1,
            ),
        );
        return () =>
            this.registered.update((previous) =>
                previous.filter((entry) => entry !== item),
            );
    }

    /** The id of item `value`'s option element. */
    itemId(value: string): string {
        const index = this.itemList().findIndex((item) => item.value === value);
        return `${this.listId}-item-${index}`;
    }

    /** Opens the list with this item highlighted (none when the opening is canceled). */
    openOn(value: string | null, reason: ChangeReason, event?: Event): void {
        const previous = untracked(this.highlighted);
        this.highlighted.set(value);
        if (!this.overlay.setOpen(true, reason, event)) {
            this.highlighted.set(previous);
        }
    }

    /** Chooses an enabled item and closes. */
    choose(value: string, reason: ChangeReason, event?: Event): void {
        const item = this.itemList().find(
            (candidate) => candidate.value === value,
        );
        if (item === undefined || item.disabled) {
            return;
        }
        this.selection.set(value, { reason, event });
        this.overlay.setOpen(false, reason, event);
    }

    /** Closes the list (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
