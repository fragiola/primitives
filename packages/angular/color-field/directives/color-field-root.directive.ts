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
import {
    type Color,
    type ColorChannel,
    type ColorSpace,
    clampColorChannel,
    colorChannelFormat,
    colorChannelRange,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { bridgeForm } from "@fragiola/primitives/form";
import { parseNumber } from "@fragiola/primitives/number";
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

/** The state every color field part shares. */
export interface ColorFieldState {
    /** The value (in the field's space, with `channel`), `null` when empty. */
    value: Color | null;
    /** The Input's text. */
    inputValue: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/** A `Color`, a string `parseColor` reads (`null` when it reads none), or `null`. */
function toColor(value: Color | string | null): Color | null {
    return value === null ? null : parseColor(value);
}

/** Black in `space`: what a channel typed into an empty field is set on. */
function black(space: ColorSpace): Color {
    return convertColor(
        { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 },
        space,
    );
}

/** The 24-bit number of a color, plus `amount`, clamped, back to an rgb color. */
function stepHex(color: Color | null, amount: number): Color {
    const rgb = convertColor(color ?? black("rgb"), "rgb") as Extract<
        Color,
        { space: "rgb" }
    >;
    const number = Math.min(
        Math.max((rgb.red << 16) + (rgb.green << 8) + rgb.blue + amount, 0),
        0xffffff,
    );
    return {
        space: "rgb",
        red: (number >> 16) & 0xff,
        green: (number >> 8) & 0xff,
        blue: number & 0xff,
        alpha: rgb.alpha,
    };
}

function round2(value: number): number {
    return Math.round(value * 100) / 100 + 0;
}

/**
 * Holds a ColorField's value, its typed text and its hidden form input, rendered right after it
 * (spec/color-field.md: a hex textbox, or the APG spinbutton for one channel; the text commits on
 * Enter and blur): `<div colorFieldRoot [(value)]="color" name="color">` around its
 * `<input colorFieldInput>`.
 */
@Directive({
    selector: "[colorFieldRoot]",
    exportAs: "colorFieldRoot",
    host: {
        "data-primitives-part": "color-field-root",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "[attr.data-channel]": "data().channel",
        "[attr.data-invalid]": "data().invalid",
        "[attr.data-valid]": "data().valid",
        "[attr.data-dirty]": "data().dirty",
        "[attr.data-touched]": "data().touched",
        "[attr.data-filled]": "data().filled",
        "[attr.data-focused]": "data().focused",
    },
})
export class ColorFieldRoot {
    /** A `Color`, a string `parseColor` reads, or `null` (empty); bound, the field is controlled. */
    readonly value = input<Color | string | null | undefined>(undefined);
    readonly valueChange = output<Color | null>();
    readonly defaultValue = input<Color | string | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<Color | null>>();
    /** The channel the field edits (none: the whole color, as hex). */
    readonly channel = input<ColorChannel | undefined>(undefined);
    /** With `channel`, the space it edits it in. */
    readonly colorSpace = input<ColorSpace | undefined>(undefined);
    /** The locale of the channel's text (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);
    readonly name = input<string | undefined>(undefined);
    /** The Input's `id` (generated unless given, or the Field's control id). */
    readonly id = input<string | undefined>(undefined);
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly required = input(false, { transform: booleanAttribute });

    private readonly host = injectHost();
    private readonly flush = injectFlush();
    private readonly generatedId = injectId("primitives-color-field");
    /** The Input's `id`. */
    readonly inputId = computed(() => this.id() ?? this.generatedId);
    private readonly own = controllable<Color | null, ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toColor(value);
        }),
        this.valueChange,
        () => toColor(this.defaultValue()),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    private readonly space = computed(() => {
        const current = this.own.value();
        const channel = this.channel();
        return channel === undefined
            ? (current?.space ?? "rgb")
            : colorSpaceFor(
                  channel,
                  current ?? black("rgb"),
                  this.colorSpace(),
              );
    });
    /** The value (in the field's space, with `channel`), `null` when empty. */
    readonly color = computed(() => {
        const current = this.own.value();
        return current === null || this.channel() === undefined
            ? current
            : convertColor(current, this.space());
    });
    /** The channel's value (channel mode), `null` when empty. */
    readonly channelValue = computed(() => {
        const value = this.color();
        const channel = this.channel();
        return value === null || channel === undefined
            ? null
            : getColorChannel(value, channel);
    });
    readonly range = computed(() => {
        const channel = this.channel();
        return channel === undefined ? undefined : colorChannelRange(channel);
    });
    /** The text the user typed, until a commit (`null`: the value's text). */
    private readonly typed = signal<string | null>(null);
    /** The value's text (the channel's, with `channel`). */
    readonly valueText = computed(() => {
        const value = this.color();
        const channel = this.channel();
        if (value === null) {
            return "";
        }
        return channel === undefined
            ? formatColor(value, "hex")
            : formatColorChannel(value, channel, this.locale());
    });
    private readonly formValue = computed(() => {
        const value = this.color();
        if (value === null) {
            return "";
        }
        return this.channel() === undefined
            ? formatColor(value, "hex")
            : String(this.channelValue());
    });
    /** The Input's text: the typed text while editing, else the value's. */
    readonly inputValue = computed(() => this.typed() ?? this.valueText());
    /** The Input's element, once rendered. */
    readonly inputElement = signal<HTMLInputElement | null>(null);
    private readonly hidden = createHiddenInput(this.host, {
        type: "text",
        "data-primitives-part": "color-field-hidden-input",
    });
    readonly field = fieldControl({
        id: this.inputId,
        labelable: true,
        value: computed(() => {
            const value = this.formValue();
            return value === "" ? null : value;
        }),
        filled: computed(() => this.color() !== null),
        input: () => this.hidden,
        focusTarget: () => this.inputElement(),
    });
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    readonly state = computed<ColorFieldState>(() => ({
        value: this.color(),
        inputValue: this.inputValue(),
        disabled: this.isDisabled(),
        readOnly: this.readOnly(),
        required: this.required(),
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
                channel: this.channel(),
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
            // the attribute follows the value, as React's controlled input
            const value = this.formValue();
            hidden.setAttribute("value", value);
            hidden.value = value;
            hidden.required = state.required;
            hidden.disabled = state.disabled;
        });
        const onHiddenFocus = () => untracked(this.inputElement)?.focus();
        hidden.addEventListener("focus", onHiddenFocus);

        // a form reset returns it to its default, and its text with it
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    this.field.reset();
                    this.typed.set(null);
                    const next = toColor(untracked(this.defaultValue));
                    if (!isSameColor(next, untracked(this.color))) {
                        this.own.set(next, { reason: "none" });
                    }
                    this.flush();
                    // the browser reset the inputs after the state: write the state back
                    hidden.value = untracked(this.formValue);
                    this.writeText();
                },
                invalid: () => untracked(this.inputElement),
            });
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            hidden.removeEventListener("focus", onHiddenFocus);
        });
    }

    /** The Input's text changed: kept until a commit. */
    inputText(text: string): void {
        this.typed.set(text);
        this.flush();
    }

    /** Parses the typed text and sets the value, or goes back to the value's text. */
    commitText(reason: "keyboard" | "input-blur", event: Event): void {
        const text = untracked(this.typed);
        if (text === null) {
            return;
        }
        this.typed.set(null);
        if (untracked(this.channel) === undefined) {
            if (text.trim() === "") {
                this.setValue(null, { reason: "input-clear", event });
            } else {
                const parsed = parseColor(text);
                if (parsed !== null) {
                    this.setValue(parsed, { reason, event });
                }
            }
        } else {
            const number = this.channelOf(text);
            if (number !== null) {
                this.setValue(this.withChannel(number), { reason, event });
            }
        }
        this.render();
    }

    /** Handles a step key; returns whether it did. */
    stepKey(key: string, shiftKey: boolean, event: Event): boolean {
        if (untracked(this.isDisabled) || untracked(this.readOnly)) {
            return false;
        }
        const reason: ChangeReason = "keyboard";
        const channel = untracked(this.channel);
        const typed = untracked(this.typed);
        const value = untracked(this.color);
        if (channel === undefined) {
            if (key !== "ArrowUp" && key !== "ArrowDown") {
                return false;
            }
            const base = typed === null ? value : (parseColor(typed) ?? value);
            this.typed.set(null);
            this.setValue(stepHex(base, key === "ArrowUp" ? 1 : -1), {
                reason,
                event,
            });
            this.render();
            return true;
        }
        const range = colorChannelRange(channel);
        const typedNumber = typed === null ? null : this.channelOf(typed);
        const base =
            typedNumber ??
            (value === null ? range.min : getColorChannel(value, channel));
        const amount = shiftKey ? range.largeStep : range.step;
        let next: number;
        switch (key) {
            case "ArrowUp":
                next = base + amount;
                break;
            case "ArrowDown":
                next = base - amount;
                break;
            case "PageUp":
                next = base + range.largeStep;
                break;
            case "PageDown":
                next = base - range.largeStep;
                break;
            case "Home":
                next = range.min;
                break;
            case "End":
                next = range.max;
                break;
            default:
                return false;
        }
        this.typed.set(null);
        this.setValue(this.withChannel(next), { reason, event });
        this.render();
        return true;
    }

    private setValue(next: Color | null, details: ChangeDetails): void {
        if (!isSameColor(next, untracked(this.color))) {
            this.own.set(next, details);
        }
    }

    /** The channel's number in `text` (channel mode), or `null`. */
    private channelOf(text: string): number | null {
        const channel = untracked(this.channel);
        if (channel === undefined) {
            return null;
        }
        const { format, scale } = colorChannelFormat(channel);
        const parsed = parseNumber(text, {
            locale: untracked(this.locale),
            format,
        });
        return parsed === null || Number.isNaN(parsed)
            ? null
            : round2(clampColorChannel(channel, parsed / scale));
    }

    private withChannel(number: number): Color {
        const channel = untracked(this.channel) as ColorChannel;
        return setColorChannel(
            untracked(this.color) ?? black(untracked(this.space)),
            channel,
            clampColorChannel(channel, round2(number)),
        );
    }

    /**
     * Renders a change at once: a controlled value comes back through its binding before the next
     * key, the hidden input holds it when the Field validates (AGENTS.md, "Porting", 8), and the
     * text is the value's even when the binding did not change (a value the consumer kept).
     */
    private render(): void {
        this.flush();
        this.writeText();
    }

    private writeText(): void {
        const element = untracked(this.inputElement);
        const text = untracked(this.inputValue);
        if (element !== null && element.value !== text) {
            element.value = text;
        }
    }
}
