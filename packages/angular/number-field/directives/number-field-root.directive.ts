import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    clampNumber,
    formatNumber,
    isNumberText,
    parseNumber,
    type ScrubPoint,
    stepNumber,
} from "@fragiola/primitives/number";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createHiddenInput,
    dataValues,
    injectFlush,
    injectHost,
    injectId,
    setInputAttribute,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** The state every part renders with (spec/number-field.md, "State attributes and ARIA"). */
export interface NumberFieldState {
    /** The value: a number, or `null` while empty. */
    value: number | null;
    /** The Input's text. */
    inputValue: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    scrubbing: boolean;
}

/** An optional number input: `min="1"` and `[min]="1"` give `1`, nothing gives `undefined`. */
export function optionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    const number = Number(value);
    return Number.isNaN(number) ? undefined : number;
}

/**
 * Holds a NumberField's value, its text and its hidden form input, rendered right after it
 * (spec/number-field.md, the APG spinbutton): `<div numberFieldRoot [(value)]="quantity"
 * name="quantity">` around its Group, Input and buttons. Every part carries its state
 * (`data-disabled`, `data-readonly`, `data-required`, `data-scrubbing`, and the Field's).
 */
@Directive({
    selector: "[numberFieldRoot]",
    exportAs: "numberFieldRoot",
    host: {
        "data-primitives-part": "number-field-root",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "[attr.data-scrubbing]": "data().scrubbing",
        "[attr.data-invalid]": "data().invalid",
        "[attr.data-valid]": "data().valid",
        "[attr.data-dirty]": "data().dirty",
        "[attr.data-touched]": "data().touched",
        "[attr.data-filled]": "data().filled",
        "[attr.data-focused]": "data().focused",
    },
})
export class NumberFieldRoot {
    /** A number, or `null` while empty; bound, the field is controlled. */
    readonly value = input<number | null | undefined>(undefined);
    readonly valueChange = output<number | null>();
    readonly defaultValue = input<number | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<number | null>>();
    readonly min = input(undefined, { transform: optionalNumber });
    readonly max = input(undefined, { transform: optionalNumber });
    /** The amount of a step (default `1`). */
    readonly step = input(1, { transform: optionalNumber });
    /** The amount of a step with Alt (default `0.1`). */
    readonly smallStep = input(0.1, { transform: optionalNumber });
    /** The amount of a step with Shift, Page Up and Page Down (default `10`). */
    readonly largeStep = input(10, { transform: optionalNumber });
    /** A step from a value off the grid goes to the grid's next point. */
    readonly snapOnStep = input(false, { transform: booleanAttribute });
    /** A typed value outside `[min, max]` is clamped on blur (default `true`). */
    readonly clampOnBlur = input(true, { transform: booleanAttribute });
    /** How the Input writes the value; default: the plain number in the locale. */
    readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
    /** The locale of the format and the parsing (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);
    /** The mouse wheel steps the value over the focused Input. */
    readonly allowWheelScrub = input(false, { transform: booleanAttribute });
    readonly required = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The Input's `id` (generated unless given, or the Field's control id). */
    readonly id = input<string | undefined>(undefined);

    private readonly host = injectHost();
    private readonly flush = injectFlush();
    private readonly generatedId = injectId("primitives-number-field");
    /** The Input's `id`. */
    readonly inputId = computed(() => this.id() ?? this.generatedId);
    private readonly own = controllable<number | null, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The text the user typed, until the blur formats it (`null`: the formatted value). */
    private readonly typed = signal<string | null>(null);
    /** A ScrubArea scrubs. */
    readonly scrubbing = signal(false);
    /** The virtual cursor of a locked scrub, `null` while none. */
    readonly cursor = signal<ScrubPoint | null>(null);
    /** The Input's element, once rendered. */
    readonly inputElement = signal<HTMLInputElement | null>(null);
    private readonly hidden = createHiddenInput(this.host, {
        type: "number",
        step: "any",
        "data-primitives-part": "number-field-hidden-input",
    });
    readonly field = fieldControl({
        id: this.inputId,
        labelable: true,
        value: this.own.value,
        filled: computed(() => this.own.value() !== null),
        input: () => this.hidden,
        focusTarget: () => this.inputElement(),
    });
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The value as `format` writes it (`aria-valuetext`), `""` while empty. */
    readonly formattedValue = computed(() =>
        formatNumber(this.own.value(), {
            locale: this.locale(),
            format: this.format(),
        }),
    );
    /** The Input's text: the typed text, else the formatted value. */
    readonly inputValue = computed(() => this.typed() ?? this.formattedValue());
    readonly state = computed<NumberFieldState>(() => ({
        value: this.own.value(),
        inputValue: this.inputValue(),
        disabled: this.isDisabled(),
        readOnly: this.readOnly(),
        required: this.required(),
        scrubbing: this.scrubbing(),
    }));
    /** The state attributes and the field's, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        const field = this.field.data();
        return {
            ...dataValues({
                disabled: state.disabled,
                readonly: state.readOnly,
                required: state.required,
                scrubbing: state.scrubbing,
            }),
            invalid: field.invalid,
            valid: field.valid,
            dirty: field.dirty,
            touched: field.touched,
            filled: field.filled,
            focused: field.focused,
        };
    });

    constructor() {
        const hidden = this.hidden;
        const formName = computed(
            () => this.field.name() ?? this.name() ?? null,
        );
        effect(() => {
            const state = this.state();
            setInputAttribute(hidden, "name", formName());
            setInputAttribute(hidden, "min", this.attribute(this.min()));
            setInputAttribute(hidden, "max", this.attribute(this.max()));
            hidden.value = state.value === null ? "" : String(state.value);
            hidden.required = state.required;
            hidden.disabled = state.disabled;
        });
        const onHiddenFocus = () => untracked(this.inputElement)?.focus();
        hidden.addEventListener("focus", onHiddenFocus);

        // a form reset returns it to its default, and writes the rendered value back (Switch's way)
        const destroyRef = inject(DestroyRef);
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    this.field.reset();
                    this.typed.set(null);
                    this.own.set(untracked(this.defaultValue), {
                        reason: "none",
                    });
                    this.flush();
                    // the browser reset the inputs after the state: write the state back (a
                    // controlled field that refuses the reset keeps its value)
                    const value = untracked(this.own.value);
                    hidden.value = value === null ? "" : String(value);
                    const element = untracked(this.inputElement);
                    if (element !== null) {
                        element.value = untracked(this.inputValue);
                    }
                },
                invalid: () => untracked(this.inputElement),
            });
        });
        destroyRef.onDestroy(() => {
            stop?.();
            hidden.removeEventListener("focus", onHiddenFocus);
        });
    }

    /** The amount of one step for an event's modifier keys (Alt: small, Shift: large). */
    amount(
        event: { altKey?: boolean; shiftKey?: boolean } | undefined,
    ): number {
        if (event?.altKey) {
            return untracked(this.smallStep) ?? 0.1;
        }
        if (event?.shiftKey) {
            return untracked(this.largeStep) ?? 10;
        }
        return untracked(this.step) ?? 1;
    }

    /**
     * Steps `times` times by `amount` (negative: down) from the value, or the typed text when it
     * reads as a number (spec/number-field.md, "Stepping"); returns whether another step that way
     * could still change it (a bound not reached).
     */
    stepBy(
        amount: number,
        reason: ChangeReason,
        event: Event | undefined,
        times = 1,
    ): boolean {
        if (!this.interactive()) {
            return false;
        }
        const min = untracked(this.min);
        const max = untracked(this.max);
        let next = this.base();
        for (let index = 0; index < times; index += 1) {
            next = stepNumber(next, amount, {
                min,
                max,
                snapOnStep: untracked(this.snapOnStep),
            });
        }
        this.typed.set(null);
        this.setValue(next, { reason, event });
        const bound = amount > 0 ? max : min;
        return bound === undefined || next !== bound;
    }

    /** Sets the value, as a step does (Home and End set a bound). */
    stepTo(next: number, reason: ChangeReason, event: Event | undefined): void {
        if (!this.interactive()) {
            return;
        }
        this.typed.set(null);
        this.setValue(next, { reason, event });
    }

    /**
     * The Input's text changed (spec/number-field.md, "Typing"): refused (`false`, the text goes
     * back) when it holds a character no number is written with; kept otherwise, and the value
     * follows it when it reads as a number, or becomes `null` when it is empty.
     */
    inputText(text: string, event: Event): boolean {
        if (!this.interactive()) {
            return false;
        }
        const options = {
            locale: untracked(this.locale),
            format: untracked(this.format),
        };
        if (!isNumberText(text, options)) {
            return false;
        }
        this.typed.set(text);
        if (text.trim() === "") {
            this.setValue(null, { reason: "input-clear", event });
            return true;
        }
        const parsed = parseNumber(text, options);
        if (parsed !== null && !Number.isNaN(parsed)) {
            this.setValue(parsed, { reason: "input-change", event });
        }
        return true;
    }

    /** The Input lost focus: the value is clamped (`clampOnBlur`) and the text formatted. */
    inputBlur(event: Event): void {
        if (untracked(this.typed) === null) {
            return;
        }
        let next = this.base();
        if (untracked(this.clampOnBlur) && next !== null) {
            next = clampNumber(next, untracked(this.min), untracked(this.max));
        }
        this.typed.set(null);
        this.setValue(next, { reason: "input-blur", event });
    }

    private interactive(): boolean {
        return !untracked(this.isDisabled) && !untracked(this.readOnly);
    }

    /** The value a step starts from: the typed text when it reads as a number. */
    private base(): number | null {
        const text = untracked(this.typed);
        const value = untracked(this.own.value);
        if (text === null) {
            return value;
        }
        const parsed = parseNumber(text, {
            locale: untracked(this.locale),
            format: untracked(this.format),
        });
        return parsed === null || Number.isNaN(parsed) ? value : parsed;
    }

    /**
     * Reports a change, then renders it at once: a controlled value comes back through its binding
     * before the next key, and the hidden input holds it when the Field validates (AGENTS.md,
     * "Porting", 8).
     */
    private setValue(next: number | null, details: ChangeDetails): void {
        this.own.set(next, details);
        this.flush();
    }

    private attribute(value: number | undefined): string | null {
        return value === undefined ? null : String(value);
    }
}
