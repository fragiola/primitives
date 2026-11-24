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
import {
    type CascadeItem,
    cascadeLevels,
    cascadePathItems,
} from "@fragiola/primitives/cascade";
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

/** Where the pointer left a parent whose level is open (spec/cascade-select.md, "Pointer"). */
export interface CascadeSafeArea {
    x: number;
    y: number;
    /** The depth of the open level the pointer travels to. */
    depth: number;
}

export interface CascadeSelectState {
    open: boolean;
    disabled: boolean;
    value: readonly string[];
}

const NONE: readonly string[] = [];

/** Whether two paths hold the same values. */
export function samePath(a: readonly string[], b: readonly string[]): boolean {
    return (
        a.length === b.length && a.every((entry, index) => entry === b[index])
    );
}

/** The first enabled item of a level, else its first. */
export function firstItem(items: readonly CascadeItem[]): string | undefined {
    return (items.find((item) => !item.disabled) ?? items[0])?.value;
}

/**
 * Holds the cascading select's state and renders its hidden form input
 * (spec/cascade-select.md): `<ng-container cascadeSelectRoot [items]="items" [(value)]="path"
 * name="location">`. The Root keeps the active path: the highlighted item of each open level, the
 * last one highlighted.
 */
@Directive({ selector: "[cascadeSelectRoot]", exportAs: "cascadeSelectRoot" })
export class CascadeSelectRoot implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** The tree: an item with children is a parent, else a leaf. */
    readonly items = input.required<readonly CascadeItem[]>();
    /** The chosen path, from the first level down (`[]`: none). */
    readonly value = input<readonly string[] | undefined>(undefined);
    readonly valueChange = output<readonly string[]>();
    readonly defaultValue = input<readonly string[]>(NONE);
    readonly valueChangeDetails = output<ValueChangeEvent<readonly string[]>>();
    /** A parent can be chosen too (spec/cascade-select.md, "Choosing"). */
    readonly changeOnSelect = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Joins the path in the hidden input (default `"/"`). */
    readonly valueSeparator = input("/");

    /** The trigger's id, once it has one: the field's label points at it. */
    readonly triggerElementId = signal<string | undefined>(undefined);
    private readonly hidden = createHiddenInput(
        inject(ElementRef).nativeElement,
        { "data-primitives-part": "cascade-select-input" },
    );
    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-cascade-select",
    );
    private readonly selection = controllable<readonly string[], ChangeDetails>(
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
        filled: computed(() => this.selected().length > 0),
        input: () => this.hidden,
        focusTarget: () => this.overlay.trigger(),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    private readonly highlight = signal<{
        active: readonly string[];
        peek: boolean;
    }>({ active: NONE, peek: false });
    /** The active path: the highlighted item of each open level, the last one highlighted. */
    readonly active = computed(() => this.highlight().active);
    /** The highlighted parent's level is open too (the pointer opened it). */
    readonly peek = computed(() => this.highlight().peek);
    /** The items of every open level, from the first. */
    readonly levels = computed(() => {
        const { active, peek } = this.highlight();
        return cascadeLevels(this.items(), peek ? active : active.slice(0, -1));
    });
    readonly placed = placementSignal({ side: "bottom", align: "start" });
    readonly state = computed<CascadeSelectState>(() => ({
        open: this.overlay.open(),
        disabled: this.isDisabled(),
        value: this.selected(),
    }));
    /** Where the pointer left an open parent, for the safe area. */
    safeArea: CascadeSafeArea | null = null;
    hoverTimer: ReturnType<typeof setTimeout> | undefined = undefined;
    private readonly baseId = injectId("primitives-cascade-select");

    constructor() {
        const hidden = this.hidden;
        effect(() => {
            hidden.value = this.selected().join(this.valueSeparator());
            setInputAttribute(
                hidden,
                "name",
                this.field.name() ?? this.name() ?? null,
            );
            hidden.required = this.required();
            hidden.disabled = this.isDisabled();
        });
        // a closed popup drops its hover timer
        effect(() => {
            if (!this.overlay.open()) {
                clearTimeout(this.hoverTimer);
                this.hoverTimer = undefined;
                this.safeArea = null;
            }
        });
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    const fallback = this.defaultValue();
                    this.field.reset();
                    this.selection.set(fallback, { reason: "none" });
                    // a value that did not change does not re-run the effect
                    hidden.value = fallback.join(this.valueSeparator());
                },
                invalid: () => this.overlay.trigger(),
            });
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            clearTimeout(this.hoverTimer);
        });
    }

    /** The id of the `listbox` of depth `depth`. */
    levelId(depth: number): string {
        return `${this.baseId}-level-${depth}`;
    }

    /** The id of the option of `value` in the open level `depth`. */
    itemId(depth: number, value: string): string {
        const index = (this.levels()[depth] ?? []).findIndex(
            (item) => item.value === value,
        );
        return `${this.baseId}-item-${depth}-${index}`;
    }

    /** Moves the highlight; `peek`: the highlighted parent's level is open too. */
    setActive(active: readonly string[], peek = false): void {
        this.highlight.set({ active, peek });
    }

    /** The active path the popup opens on: the chosen path, else the first enabled item. */
    initialActive(): readonly string[] {
        const items = this.items();
        const value = this.selected();
        const found = cascadePathItems(items, value);
        if (found !== null && found.length > 0) {
            return value;
        }
        const first = firstItem(items);
        return first === undefined ? NONE : [first];
    }

    /** Opens the popup on this active path (none when the opening is canceled). */
    openOn(
        active: readonly string[],
        reason: ChangeReason,
        event?: Event,
    ): void {
        const previous = untracked(this.highlight);
        this.highlight.set({ active, peek: false });
        if (!this.overlay.setOpen(true, reason, event)) {
            this.highlight.set(previous);
        }
    }

    /** Chooses an enabled path; closes the popup unless `keepOpen`. */
    choose(
        path: readonly string[],
        reason: ChangeReason,
        event?: Event,
        keepOpen = false,
    ): void {
        const found = cascadePathItems(this.items(), path);
        if (
            found === null ||
            found.length === 0 ||
            found.some((item) => item.disabled)
        ) {
            return;
        }
        this.selection.set(path, { reason, event });
        if (!keepOpen) {
            this.overlay.setOpen(false, reason, event);
        }
    }

    /** Closes the popup (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
