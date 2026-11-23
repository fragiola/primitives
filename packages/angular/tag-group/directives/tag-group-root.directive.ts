import {
    afterNextRender,
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    removalFocusIndex,
    rovingTabStop,
    tagGroupKeyTarget,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    applySelection,
    createListModel,
    listPressSelection,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
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

/** How many tags a TagGroup selects (spec/tag-group.md, "API"). */
export type TagGroupSelectionMode = "none" | "single" | "multiple";

export interface TagGroupRootState {
    disabled: boolean;
    empty: boolean;
}

/** A rendered Tag, as the Root knows it. */
export interface TagGroupTagEntry {
    element: HTMLElement;
    value: string;
    disabled: boolean;
}

const NONE: readonly string[] = [];
const NO_MODIFIERS = { shiftKey: false, ctrlKey: false, metaKey: false };

/** The tags in document order. */
function inOrder(entries: readonly TagGroupTagEntry[]): TagGroupTagEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/**
 * A focusable group of tags (spec/tag-group.md, React Aria's grid of tags): the selection, the
 * roving focus, the removal and its focus rule, the Field binding.
 * `<div tagGroupRoot selectionMode="multiple" [(value)]="selected" removable (remove)="drop($event.value)">`
 * around a `[tagGroupLabel]` and a `[tagGroupList]` of `[tagGroupTag]`s, each holding one
 * `[tagGroupTagCell]`. Angular cannot tell whether `(remove)` is bound: `removable` says the
 * tags can be removed (React's and Vue's `onRemove` given).
 */
@Directive({
    selector: "[tagGroupRoot]",
    exportAs: "tagGroupRoot",
    host: {
        "data-primitives-part": "tag-group-root",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-empty]": "data().empty",
    },
})
export class TagGroupRoot {
    /** How many tags can be selected (default `"none"`). */
    readonly selectionMode = input<TagGroupSelectionMode>("none");
    /** The selected tags' values, in the tags' order (controlled, `[(value)]`). */
    readonly value = input<readonly string[] | undefined>(undefined);
    readonly valueChange = output<readonly string[]>();
    readonly defaultValue = input<readonly string[] | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<readonly string[]>>();
    /** The values of the disabled tags. */
    readonly disabledKeys = input<readonly string[]>(NONE);
    /** Every tag is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The tags can be removed: Delete, Backspace and the RemoveButtons emit `(remove)`. */
    readonly removable = input(false, { transform: booleanAttribute });
    /** A tag asks to be removed: remove it in the handler, or keep it. */
    readonly remove = output<ValueChangeEvent<string>>();
    /** The arrows wrap from the last tag to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    private readonly flush = injectFlush();
    private readonly selection = controllable<readonly string[], ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue() ?? NONE,
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The selected values. */
    readonly selected = computed(() => this.selection.value());
    private readonly entries = signal<readonly TagGroupTagEntry[]>([]);
    // the tags' document order, read when it is used: a keyed reorder moves the elements
    private readonly ordered = () => inOrder(this.entries());
    private readonly active = signal<HTMLElement | null>(null);
    // a server render knows no tag: it never says "empty" (spec/tag-group.md, "Empty state")
    private readonly mounted = signal(false);
    private anchor: string | null = null;
    /** The List, registered by `[tagGroupList]`. */
    readonly list = signal<HTMLElement | null>(null);
    /** The Label's id, registered by `[tagGroupLabel]`. */
    readonly labelId = signal<string | undefined>(undefined);

    /** Inside a `[fieldRoot]`, the List is the field's control (spec/tag-group.md, "Forms"). */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: computed(() => this.selected()),
        filled: computed(() => this.selected().length > 0),
        input: () => null,
        element: () => untracked(this.list) ?? this.host,
        focusTarget: () => this.tabStopElement(),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** No Tag is rendered, once mounted. */
    readonly empty = computed(
        () => this.mounted() && this.entries().length === 0,
    );
    /** The List's `aria-labelledby`: the field's label, else the Label's id. */
    readonly labelledBy = computed(
        () => this.field.labelledBy() ?? this.labelId() ?? null,
    );
    /** The Tag holding the tab stop (`tabindex="0"`). */
    readonly tabStop = computed<HTMLElement | null>(() => {
        const items = this.ordered();
        const active = this.active();
        const index = rovingTabStop(
            items.length,
            items.findIndex((entry) => entry.element === active),
            (candidate) => this.skipped(items[candidate]),
        );
        return items[index]?.element ?? null;
    });
    readonly state = computed<TagGroupRootState>(() => ({
        disabled: this.isDisabled(),
        empty: this.empty(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        afterNextRender(() => this.mounted.set(true));
    }

    /** Whether a tag is disabled: its own `disabled`, `disabledKeys`, the group's. */
    tagDisabled(value: string, own: boolean): boolean {
        return own || this.isDisabled() || this.disabledKeys().includes(value);
    }

    private skipped(entry: TagGroupTagEntry | undefined): boolean {
        return (
            entry === undefined || this.tagDisabled(entry.value, entry.disabled)
        );
    }

    private tabStopElement(): HTMLElement | null {
        return untracked(this.tabStop);
    }

    private select(
        change: SelectionChange | null,
        reason: ChangeReason,
        event: Event,
    ): void {
        const mode = untracked(this.selectionMode);
        if (change === null || mode === "none") {
            return;
        }
        untracked(() => {
            const current = this.selected();
            const model = createListModel(
                this.ordered().map((entry) => ({
                    key: entry.value,
                    textValue: "",
                    disabled: this.skipped(entry),
                })),
            );
            const next = applySelection(
                model,
                { selected: current, anchor: this.anchor },
                change,
                { mode, behavior: "toggle" },
            );
            this.anchor = next.anchor;
            if (!sameSelection(next.selected, current)) {
                this.selection.set([...next.selected], { reason, event });
            }
        });
    }

    private pressSelection(value: string): SelectionChange | null {
        const mode = untracked(this.selectionMode);
        return mode === "none"
            ? null
            : listPressSelection(value, NO_MODIFIERS, {
                  mode,
                  behavior: "toggle",
              });
    }

    /** A key on the List (spec/tag-group.md, "Keyboard"). */
    listKeyDown(event: KeyboardEvent): void {
        if (untracked(this.isDisabled) || event.defaultPrevented) {
            return;
        }
        const items = untracked(this.ordered);
        const index = items.findIndex(
            (entry) => entry.element === event.target,
        );
        const entry = items[index];
        if (entry === undefined) {
            return;
        }
        const list = event.currentTarget as HTMLElement;
        const action = untracked(() =>
            tagGroupKeyTarget(event, index, items.length, {
                rtl: getDirection(list, this.direction()) === "rtl",
                loop: this.loopFocus(),
                skip: (candidate) => this.skipped(items[candidate]),
                selectable: this.selectionMode() !== "none",
                removable: this.removable(),
            }),
        );
        if (action === null) {
            return;
        }
        event.preventDefault();
        if (action.type === "focus") {
            items[action.index]?.element.focus();
        } else if (action.type === "select") {
            this.select(this.pressSelection(entry.value), "keyboard", event);
        } else {
            this.removeTag(entry.element, "keyboard", event);
            return;
        }
        // the new tab stop and selection reach the DOM before the next key (AGENTS.md, "Porting")
        this.flush();
    }

    /** Registers a Tag for as long as it lives; returns its unregistration. */
    register(entry: TagGroupTagEntry): () => void {
        this.entries.update((current) => [...current, entry]);
        return () =>
            this.entries.update((current) =>
                current.filter((item) => item !== entry),
            );
    }

    /** A Tag took focus. */
    focused(element: HTMLElement): void {
        this.active.set(element);
    }

    /** A press on a Tag (spec/tag-group.md, "Pointer"). */
    press(element: HTMLElement, event: MouseEvent): void {
        const entry = untracked(this.entries).find(
            (candidate) => candidate.element === element,
        );
        if (entry === undefined || untracked(() => this.skipped(entry))) {
            return;
        }
        this.select(this.pressSelection(entry.value), "item-press", event);
        this.flush();
    }

    /**
     * A Tag asks to be removed (spec/tag-group.md, "Focus"): once the app handled `(remove)` and
     * the page rendered it, a kept tag is focused, else the next enabled tag, else the previous
     * one, else the List.
     */
    removeTag(item: HTMLElement, reason: ChangeReason, event?: Event): void {
        const items = untracked(this.ordered);
        const index = items.findIndex((entry) => entry.element === item);
        const entry = items[index];
        if (
            entry === undefined ||
            untracked(() => this.skipped(entry)) ||
            !untracked(this.removable)
        ) {
            return;
        }
        this.remove.emit({ value: entry.value, details: { reason, event } });
        this.flush();
        // the app kept it: it keeps the focus
        if (item.isConnected) {
            item.focus();
            return;
        }
        const target = removalFocusIndex(items.length, index, (candidate) => {
            const other = items[candidate];
            return (
                other === undefined ||
                !other.element.isConnected ||
                untracked(() => this.skipped(other))
            );
        });
        (target === -1
            ? untracked(this.list)
            : items[target]?.element
        )?.focus();
    }
}
