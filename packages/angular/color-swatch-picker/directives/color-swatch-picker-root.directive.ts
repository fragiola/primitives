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
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    createListModel,
    type ListModel,
    listKeyTarget,
    rowTarget,
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
    injectColorPickerBinding,
    injectFlush,
    injectHost,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export interface ColorSwatchPickerRootState {
    /** The selected color, or `null`. */
    value: Color | null;
    disabled: boolean;
}

/** A rendered Item, as the Root knows it. */
export interface ColorSwatchPickerItemEntry {
    element: HTMLElement;
    /** Its color's key: `formatColor(color, "hexa")`. */
    key: string;
    color: Color;
    disabled: boolean;
}

/** A `Color`, a string `parseColor` reads (`null` when it reads none), or `null`. */
function toColor(value: Color | string | null): Color | null {
    return value === null ? null : parseColor(value);
}

/** The items in document order. */
function inOrder(
    entries: readonly ColorSwatchPickerItemEntry[],
): ColorSwatchPickerItemEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The list model of the rendered items (`@fragiola/primitives/selection`). */
function modelOf(entries: readonly ColorSwatchPickerItemEntry[]): ListModel {
    return createListModel(
        entries.map((entry) => ({
            key: entry.key,
            textValue: "",
            disabled: entry.disabled,
        })),
    );
}

/**
 * A palette of swatches for choosing one color (spec/color-swatch-picker.md, the APG listbox in
 * single selection): `<div colorSwatchPickerRoot [(value)]="color">` around its
 * `[colorSwatchPickerItem]`s; its roving focus, the arrows along and between its rows, and the
 * hidden input it appends as its last child. Inside a `[fieldRoot]`, the field's control.
 */
@Directive({
    selector: "[colorSwatchPickerRoot]",
    exportAs: "colorSwatchPickerRoot",
    host: {
        role: "listbox",
        "aria-orientation": "horizontal",
        "data-primitives-part": "color-swatch-picker-root",
        "[attr.aria-disabled]": "isDisabled() ? 'true' : null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "data().disabled",
        "(keydown)": "onKeyDown($event)",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class ColorSwatchPickerRoot {
    /** A `Color`, a string `parseColor` reads, or `null`; bound, the picker is controlled. */
    readonly value = input<Color | string | null | undefined>(undefined);
    readonly valueChange = output<Color | null>();
    /** The selection at first (default `null`: none). */
    readonly defaultValue = input<Color | string | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<Color | null>>();
    /** Every option is disabled and none takes focus. */
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);

    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    private readonly flush = injectFlush();
    /** The enclosing ColorPicker's binding (spec/color-picker.md, "Sharing the color"). */
    private readonly picker = injectColorPickerBinding();
    /** Bound to the picker's color: inside one, with neither `value` nor `defaultValue`. */
    private readonly bound = computed(() =>
        this.picker !== null &&
        this.value() === undefined &&
        this.defaultValue() === undefined
            ? this.picker
            : null,
    );
    private readonly own = controllable<Color | null, ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toColor(value);
        }),
        this.valueChange,
        () => toColor(this.defaultValue() ?? null),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The selected color: the picker's when bound, else its own. */
    readonly color = computed(() => {
        const bound = this.bound();
        return bound === null ? this.own.value() : bound.value();
    });
    /** The selected color's key, or `null`. */
    readonly selected = computed(() => {
        const color = this.color();
        return color === null ? null : formatColor(color, "hexa");
    });
    private readonly entries = signal<readonly ColorSwatchPickerItemEntry[]>(
        [],
    );
    private readonly ordered = () => inOrder(this.entries());
    private readonly active = signal<HTMLElement | null>(null);
    private readonly within = signal(false);
    /** The hidden input, once created (in the browser). */
    private hidden: HTMLInputElement | null = null;

    /** The enclosing field's binding: the list is the field's control, with no labelable element. */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: this.color,
        filled: computed(() => this.color() !== null),
        input: () => this.hidden,
        element: () => this.host,
        focusTarget: () => this.tabStopElement(),
        // inside a ColorPicker, the picker is the field's control
        part: this.picker !== null,
    });
    /** Its own `disabled`, the field's, or the enclosing picker's. */
    readonly isDisabled = computed(
        () =>
            this.disabled() ||
            this.field.disabled() ||
            (this.picker?.disabled() ?? false),
    );
    /** The hidden input's name: none when bound, else its Field's, which wins, or its own. */
    private readonly formName = computed(() =>
        this.bound() === null ? (this.field.name() ?? this.name()) : undefined,
    );
    /** The Item holding the tab stop; `null` before the items are known, or while disabled. */
    readonly tabStop = computed<HTMLElement | null>(() =>
        this.isDisabled() ? null : this.tabStopOf(this.ordered()),
    );
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    readonly highlighted = computed<HTMLElement | null>(() =>
        this.within() && !this.isDisabled() ? this.active() : null,
    );
    readonly state = computed<ColorSwatchPickerRootState>(() => ({
        value: this.color(),
        disabled: this.isDisabled(),
    }));
    protected readonly data = computed(() =>
        dataValues({ disabled: this.isDisabled() }),
    );

    constructor() {
        const host = this.host;
        writeFieldAria(this.field, host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
        // the hidden input is the Root's last child, as React renders it; inserted after the first
        // render, never on a server nor during a hydration (spec/README.md, "Server rendering")
        const hidden = host.ownerDocument.createElement("input");
        hidden.type = "hidden";
        hidden.setAttribute(
            "data-primitives-part",
            "color-swatch-picker-input",
        );
        let mounted = false;
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            mounted = true;
            host.appendChild(hidden);
            this.hidden = hidden;
            this.writeInput(hidden);
            stop = bridgeForm(hidden, {
                reset: () => {
                    // a bound picker is reset by its ColorPicker
                    if (untracked(this.bound) !== null) {
                        return;
                    }
                    this.field.reset();
                    this.own.set(
                        toColor(untracked(this.defaultValue) ?? null),
                        {
                            reason: "none",
                        },
                    );
                },
                invalid: () => this.tabStopElement(),
            });
        });
        afterRenderEffect({
            write: () => {
                this.color();
                this.formName();
                this.isDisabled();
                if (mounted) {
                    untracked(() => this.writeInput(hidden));
                }
            },
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            hidden.remove();
        });
    }

    private writeInput(hidden: HTMLInputElement): void {
        const name = this.formName();
        if (name === undefined) {
            hidden.removeAttribute("name");
        } else {
            hidden.name = name;
        }
        const color = this.color();
        hidden.value = color === null ? "" : formatColor(color, "hex");
        hidden.disabled = this.isDisabled();
    }

    private tabStopOf(
        items: readonly ColorSwatchPickerItemEntry[],
    ): HTMLElement | null {
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
            items.find((entry) => entry.key === selected)?.element ??
            items[0]?.element ??
            null
        );
    }

    /** The list's tab stop's element, where a failed validation sends the focus. */
    tabStopElement(): HTMLElement | null {
        return untracked(() => this.tabStopOf(this.ordered()));
    }

    /** Chooses the Item of `key` (not a disabled one, nor the selected one again). */
    private choose(key: string, reason: ChangeReason, event?: Event): void {
        const entry = untracked(this.ordered).find(
            (candidate) => candidate.key === key,
        );
        if (
            entry === undefined ||
            entry.disabled ||
            key === untracked(this.selected)
        ) {
            return;
        }
        const details = { reason, event };
        const bound = untracked(this.bound);
        if (bound === null) {
            this.own.set(entry.color, details);
            return;
        }
        this.valueChange.emit(entry.color);
        this.valueChangeDetails.emit({ value: entry.color, details });
        bound.setValue(entry.color, details);
        bound.commit(entry.color, details);
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
        const elements = items.map((entry) => entry.element);
        if (
            (event.key === "ArrowDown" || event.key === "ArrowUp") &&
            !event.altKey
        ) {
            event.preventDefault();
            const target = rowTarget(
                elements,
                index,
                event.key === "ArrowDown" ? 1 : -1,
            );
            elements[target]?.focus();
            this.flush();
            return;
        }
        const result = listKeyTarget(event, modelOf(items), index, {
            orientation: "horizontal",
            rtl: getDirection(this.host, this.direction()) === "rtl",
            loop: true,
            mode: "single",
            behavior: "toggle",
        });
        if (result === null) {
            return;
        }
        event.preventDefault();
        elements[result.index]?.focus();
        if (result.selection?.type === "replace") {
            this.choose(result.selection.key, "keyboard", event);
        }
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
        this.field.blurred();
    }

    /** Registers an Item for as long as it lives; returns its unregistration. */
    register(entry: ColorSwatchPickerItemEntry): () => void {
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

    /** A press on an Item. */
    press(element: HTMLElement, event: MouseEvent): void {
        const entry = untracked(this.ordered).find(
            (candidate) => candidate.element === element,
        );
        if (entry === undefined || untracked(this.isDisabled)) {
            return;
        }
        element.focus();
        this.choose(entry.key, "item-press", event);
        this.flush();
    }
}
