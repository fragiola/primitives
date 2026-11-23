import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import { ratingKeyTarget } from "@fragiola/primitives/range";
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

export interface RatingRootState {
    value: number;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/**
 * A score chosen among stars (spec/rating.md, the APG's rating radio group): the `radiogroup`,
 * one `radio` per star, one tab stop, the arrows step the value and move the focus, a pointer
 * previews the value it would choose. The consumer renders one `[ratingItem]` per star, from
 * `items()`: `<div ratingRoot #rating="ratingRoot" name="rating">
 * @for (index of rating.items(); track index) { <button ratingItem [index]="index">...</button> }
 * <input ratingHiddenInput /></div>`. Inside a `[fieldRoot]`, the Root is the field's control.
 */
@Directive({
    selector: "[ratingRoot]",
    exportAs: "ratingRoot",
    host: {
        role: "radiogroup",
        "data-primitives-part": "rating-root",
        "[attr.aria-readonly]": "state().readOnly ? 'true' : null",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.aria-required]": "state().required ? 'true' : null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "(pointerleave)": "hovered.set(null)",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class RatingRoot {
    /** The score, `0` for none (controlled): `[(value)]`. */
    readonly bound = input<number | undefined>(undefined, { alias: "value" });
    readonly valueChange = output<number>();
    /** The score at first (default `0`: none). */
    readonly defaultValue = input(0, { transform: numberAttribute });
    readonly valueChangeDetails = output<ValueChangeEvent<number>>();
    /** The number of stars (default `5`). */
    readonly count = input(5, { transform: numberAttribute });
    /** Half steps: the arrows step by 0.5, a press on a star's inline-start half chooses its half. */
    readonly allowHalf = input(false, { transform: booleanAttribute });
    /** A press that chooses the current value again clears it (default `false`). */
    readonly allowClear = input(false, { transform: booleanAttribute });
    /** Shown and focusable; nothing changes it. */
    readonly readOnly = input(false, { transform: booleanAttribute });
    /** Every star is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The form's validation fails while the value is `0`. */
    readonly required = input(false, { transform: booleanAttribute });
    /** The HiddenInput's name. */
    readonly name = input<string | undefined>(undefined);
    /** The arrows wrap from `count` to the first step and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    private readonly flush = injectFlush();
    private readonly selection = controllable<number, ChangeDetails>(
        this.bound,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The score, `0` for none. */
    readonly value = this.selection.value;
    /** The stars' indexes, `1` to `count`: the consumer renders one Item per entry. */
    readonly items = computed(() =>
        Array.from({ length: this.count() }, (_, index) => index + 1),
    );
    /** The pointer's preview, `null` while none runs. */
    protected readonly hovered = signal<number | null>(null);
    private readonly stars = new Map<number, HTMLElement>();
    /** The HiddenInput, registered by `[ratingHiddenInput]`. */
    readonly hiddenInput = signal<HTMLInputElement | null>(null);

    /**
     * The enclosing field's binding (spec/field.md): the Root is the field's control, with no
     * labelable element; the validated element is the HiddenInput.
     */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: this.value,
        filled: computed(() => this.value() > 0),
        input: () => untracked(this.hiddenInput),
        element: () => this.host,
        focusTarget: () => this.tabStopElement(),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** Nothing changes it: disabled or read-only. */
    readonly interactive = computed(
        () => !this.isDisabled() && !this.readOnly(),
    );
    /** The HiddenInput's name: its Field's, which wins (spec/field.md), or the Root's. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    /** The value the stars draw: the pointer's preview while it runs, else the value. */
    readonly displayed = computed(() => {
        const hovered = this.hovered();
        return this.interactive() && hovered !== null ? hovered : this.value();
    });
    /** The star holding the tab stop (1 to `count`), `null` for none (disabled). */
    readonly tabStop = computed(() => {
        const value = this.value();
        return this.isDisabled() ? null : value > 0 ? Math.ceil(value) : 1;
    });
    readonly state = computed<RatingRootState>(() => ({
        value: this.value(),
        disabled: this.isDisabled(),
        readOnly: this.readOnly(),
        required: this.required(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            readonly: state.readOnly,
            required: state.required,
        });
    });

    constructor() {
        writeFieldAria(this.field, this.host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
    }

    /** Focus left the Root (not to one of its stars): the field is touched. */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        this.field.blurred();
    }

    /** Sets the value. */
    choose(value: number, reason: ChangeReason, event: Event): void {
        this.selection.set(value, { reason, event });
    }

    /** The pointer's preview over a star. */
    preview(value: number): void {
        if (untracked(this.interactive)) {
            this.hovered.set(value);
        }
    }

    /** A key on a star (spec/rating.md, "Keyboard"); `true` when it was handled. */
    keyDown(key: string, index: number, event: Event): boolean {
        if (!untracked(this.interactive)) {
            return false;
        }
        const current = untracked(this.value);
        if (key === " ") {
            // checks the focused star, when it is not checked (spec/rating.md, "Keyboard")
            if (Math.ceil(current) !== index || current <= 0) {
                this.choose(index, "keyboard", event);
            }
            return true;
        }
        const target = ratingKeyTarget(key, current, {
            count: untracked(this.count),
            allowHalf: untracked(this.allowHalf),
            rtl: getDirection(this.host, this.direction()) === "rtl",
            loop: untracked(this.loopFocus),
        });
        if (target === null) {
            return false;
        }
        this.stars.get(Math.ceil(target))?.focus();
        this.choose(target, "keyboard", event);
        // the new tab stop and check reach the DOM before the next key (AGENTS.md, "Porting")
        this.flush();
        return true;
    }

    /** A form reset: back to `defaultValue`. */
    reset(): void {
        this.field.reset();
        this.selection.set(untracked(this.defaultValue), { reason: "none" });
    }

    /** The tab stop's element, where a failed validation sends the focus. */
    tabStopElement(): HTMLElement | null {
        const star = untracked(this.tabStop);
        return star === null ? null : (this.stars.get(star) ?? null);
    }

    /** Registers a star's element for as long as it lives; returns its unregistration. */
    registerItem(index: number, element: HTMLElement): () => void {
        this.stars.set(index, element);
        return () => {
            if (this.stars.get(index) === element) {
                this.stars.delete(index);
            }
        };
    }
}
