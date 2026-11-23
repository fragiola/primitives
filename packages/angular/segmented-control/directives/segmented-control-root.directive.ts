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
import { radioKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
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

export type SegmentedControlOrientation = "horizontal" | "vertical";

export interface SegmentedControlRootState {
    /** The checked Item's value, `null` for none. */
    value: string | null;
    disabled: boolean;
    required: boolean;
    orientation: SegmentedControlOrientation;
}

/** An Item of the control, as it registered (spec/segmented-control.md). */
export interface SegmentedControlItemEntry {
    value: string;
    disabled: boolean;
    element: HTMLElement;
}

/** The Items in document order. */
function inOrder(
    entries: readonly SegmentedControlItemEntry[],
): SegmentedControlItemEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The Item holding the tab stop: the checked one when enabled, else the first enabled one. */
function tabStopOf(
    entries: readonly SegmentedControlItemEntry[],
    value: string | null,
): SegmentedControlItemEntry | undefined {
    const enabled = inOrder(entries).filter((entry) => !entry.disabled);
    return enabled.find((entry) => entry.value === value) ?? enabled[0];
}

/**
 * A single choice among segments, with an Indicator that follows the checked one
 * (spec/segmented-control.md, the APG radio group): the `radiogroup`, one tab stop, the arrows
 * move the focus and the check together, and a hidden input (appended as its last child) for
 * native forms: `<div segmentedControlRoot [(value)]="view" name="view">` around its
 * `[segmentedControlItem]` buttons and a `<span *segmentedControlIndicator>`. Inside a
 * `[fieldRoot]`, the Root is the field's control (spec/field.md, "Integration contract").
 */
@Directive({
    selector: "[segmentedControlRoot]",
    exportAs: "segmentedControlRoot",
    host: {
        role: "radiogroup",
        "data-primitives-part": "segmented-control-root",
        "[attr.aria-orientation]": "state().orientation",
        "[attr.aria-required]": "state().required ? 'true' : null",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-required]": "data().required",
        "[attr.data-orientation]": "data().orientation",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class SegmentedControlRoot {
    /** The checked Item's value; `null` for none (controlled). */
    readonly value = input<string | null | undefined>(undefined);
    readonly valueChange = output<string | null>();
    /** The Item checked at first (default: none). */
    readonly defaultValue = input<string | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<string | null>>();
    /** Disables every Item. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The form's validation fails while no Item is checked. */
    readonly required = input(false, { transform: booleanAttribute });
    /** The hidden input's name. */
    readonly name = input<string | undefined>(undefined);
    /** `aria-orientation` and `data-orientation` (default `"horizontal"`); it changes no key. */
    readonly orientation = input<SegmentedControlOrientation>("horizontal");
    /** The arrows wrap from the last Item to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly host = injectHost();
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    readonly providedDirection = injectProvidedDirection();
    private readonly flush = injectFlush();
    private readonly selection = controllable<string | null, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The checked Item's value, `null` for none. */
    readonly checked = this.selection.value;
    private readonly items = signal<readonly SegmentedControlItemEntry[]>([]);
    /** The hidden input: what the form submits and validates. */
    private readonly hidden: HTMLInputElement;

    /**
     * The enclosing field's binding (spec/field.md): the Root is the field's control, with no
     * labelable element; the validated element is the hidden input, and a Form focuses its tab
     * stop.
     */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: this.checked,
        filled: computed(() => this.checked() !== null),
        input: () => this.hidden,
        element: () => this.host,
        focusTarget: () => this.tabStopElement(),
    });
    /** Its own `disabled`, or the field's: every Item inside is disabled. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The hidden input's name: its Field's, which wins (spec/field.md), or the Root's. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    /**
     * The value of the Item holding the tab stop, `null` for none: before the Items registered (a
     * server render), the checked one.
     */
    readonly tabStop = computed(() => {
        if (this.isDisabled()) {
            return null;
        }
        const items = this.items();
        const value = this.checked();
        return items.length === 0
            ? value
            : (tabStopOf(items, value)?.value ?? null);
    });
    /** The checked Item's element, once it registered: the Indicator's measurement. */
    readonly checkedElement = computed(() => {
        const value = this.checked();
        return value === null
            ? null
            : (this.items().find((entry) => entry.value === value)?.element ??
                  null);
    });
    readonly state = computed<SegmentedControlRootState>(() => ({
        value: this.checked(),
        disabled: this.isDisabled(),
        required: this.required(),
        orientation: this.orientation(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            required: state.required,
            orientation: state.orientation,
        });
    });

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
        hidden.setAttribute("aria-hidden", "true");
        hidden.tabIndex = -1;
        hidden.setAttribute("data-primitives-part", "segmented-control-input");
        Object.assign(hidden.style, VISUALLY_HIDDEN_INPUT_STYLE);
        this.hidden = hidden;
        let mounted = false;
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            mounted = true;
            this.writeInput();
            host.appendChild(hidden);
            stop = bridgeForm(hidden, {
                // a form reset returns the control to its default (spec/segmented-control.md)
                reset: () => {
                    this.field.reset();
                    this.selection.set(untracked(this.defaultValue), {
                        reason: "none",
                    });
                    // the browser reset the input to its default: write the value back
                    hidden.value = untracked(this.checked) ?? "";
                },
                invalid: () => this.tabStopElement(),
            });
        });
        afterRenderEffect({
            write: () => {
                this.checked();
                this.formName();
                this.isDisabled();
                this.required();
                if (mounted) {
                    untracked(() => this.writeInput());
                }
            },
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            hidden.remove();
        });
    }

    /** Writes the hidden input: its name only while an Item is checked (a radio set's). */
    private writeInput(): void {
        const hidden = this.hidden;
        const value = this.checked();
        const name = this.formName();
        if (value === null || name === undefined) {
            hidden.removeAttribute("name");
        } else {
            hidden.setAttribute("name", name);
        }
        hidden.value = value ?? "";
        hidden.required = this.required();
        hidden.disabled = this.isDisabled();
    }

    /** Focus left the Root (not to one of its Items): the field is touched. */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        this.field.blurred();
    }

    /** Checks an Item. */
    select(value: string, reason: ChangeReason, event: Event): void {
        this.selection.set(value, { reason, event });
    }

    /**
     * An arrow key on an Item: moves the focus and the check (spec/segmented-control.md,
     * "Keyboard"); `true` when it moved.
     */
    navigate(key: string, from: HTMLElement, event: Event): boolean {
        const ordered = inOrder(untracked(this.items));
        const index = ordered.findIndex((entry) => entry.element === from);
        if (index === -1) {
            return false;
        }
        const target = radioKeyTarget(key, index, ordered.length, {
            rtl: getDirection(this.host, this.providedDirection()) === "rtl",
            loop: untracked(this.loopFocus),
            skip: (candidate) => ordered[candidate]?.disabled ?? true,
        });
        const entry = target === null ? undefined : ordered[target];
        if (entry === undefined) {
            return false;
        }
        entry.element.focus();
        this.select(entry.value, "keyboard", event);
        // the new tab stop and check reach the DOM before the next key (AGENTS.md, "Porting")
        this.flush();
        return true;
    }

    /** The tab stop's element, where a failed validation sends the focus. */
    tabStopElement(): HTMLElement | null {
        if (untracked(this.isDisabled)) {
            return null;
        }
        return (
            tabStopOf(untracked(this.items), untracked(this.checked))
                ?.element ?? null
        );
    }

    /** The Root's element, which the Indicator is measured from. */
    get element(): HTMLElement {
        return this.host;
    }

    /** Registers an Item for as long as it lives; returns its unregistration. */
    register(entry: SegmentedControlItemEntry): () => void {
        this.items.update((current) => [...current, entry]);
        return () =>
            this.items.update((current) =>
                current.filter((item) => item !== entry),
            );
    }
}
