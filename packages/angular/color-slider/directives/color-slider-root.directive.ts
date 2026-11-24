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
    PLATFORM_ID,
    signal,
    untracked,
} from "@angular/core";
import {
    type Color,
    type ColorChannel,
    type ColorSpace,
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
import { snapToStep } from "@fragiola/primitives/range";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectHost,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import { writeLabelledBy } from "../utils/write-labelled-by.ts";

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** A `Color`, or a string `parseColor` reads (black when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? BLACK;
}

/** The state every color slider part shares. */
export interface ColorSliderState {
    /** The value, in the slider's space. */
    color: Color;
    channel: ColorChannel;
    /** The channel's value. */
    value: number;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
}

/**
 * Holds a color slider's value; the `group` with the hidden input holding the color as hex at its
 * end (spec/color-slider.md, the APG slider): `<div colorSliderRoot channel="hue"
 * [(value)]="color" name="color">`. A `[colorSliderLabel]` names the group and its Thumb.
 */
@Directive({
    selector: "[colorSliderRoot]",
    exportAs: "colorSliderRoot",
    host: {
        role: "group",
        "data-primitives-part": "color-slider-root",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-channel]": "data().channel",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
    },
})
export class ColorSliderRoot {
    /** A `Color`, or a string `parseColor` reads; bound, the slider is controlled. */
    readonly value = input<Color | string | undefined>(undefined);
    readonly valueChange = output<Color>();
    readonly defaultValue = input<Color | string>("#000000");
    readonly valueChangeDetails = output<ValueChangeEvent<Color>>();
    /** When a drag ends, or after a key changed the value. */
    readonly valueCommit = output<Color>();
    /** The channel the slider edits. */
    readonly channel = input.required<ColorChannel>();
    /** The space it edits the channel in (default: the value's, else the channel's own). */
    readonly colorSpace = input<ColorSpace | undefined>(undefined);
    readonly orientation = input<"horizontal" | "vertical">("horizontal");
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The locale of the channel's text (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);

    private readonly current = controllable<Color, ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toColor(value);
        }),
        this.valueChange,
        () => toColor(this.defaultValue()),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The space the channel is edited in. */
    readonly space = computed(() =>
        colorSpaceFor(this.channel(), this.current.value(), this.colorSpace()),
    );
    /** The value, in the slider's space. */
    readonly color = computed(() =>
        convertColor(this.current.value(), this.space()),
    );
    /** The channel's value. */
    readonly channelValue = computed(() =>
        getColorChannel(this.color(), this.channel()),
    );
    readonly range = computed(() => colorChannelRange(this.channel()));
    private readonly hex = computed(() => formatColor(this.color(), "hex"));
    /** The channel's text (`Intl`, spec/color.md): the Output's and the Thumb's `aria-valuetext`. */
    readonly valueText = computed(() =>
        formatColorChannel(
            this.color(),
            this.channel(),
            this.locale(),
            this.channelValue(),
        ),
    );
    /** The hidden input, once created (in the browser). */
    private hidden: HTMLInputElement | null = null;
    /** The Thumb, while one is rendered. */
    readonly thumb = signal<HTMLElement | null>(null);
    /** The Thumb's id: the Output's `for`. */
    readonly thumbId = signal<string | undefined>(undefined);
    /** The Label's id while one is rendered. */
    readonly labelId = signal<string | undefined>(undefined);
    readonly dragging = signal(false);
    /** The enclosing field's binding, for the root and the thumb (spec/field.md). */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: this.hex,
        // a slider always has a value
        filled: signal(true),
        input: () => this.hidden,
        focusTarget: () => untracked(this.thumb),
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    readonly providedDirection = injectProvidedDirection();
    readonly state = computed<ColorSliderState>(() => ({
        color: this.color(),
        channel: this.channel(),
        value: this.channelValue(),
        orientation: this.orientation(),
        disabled: this.isDisabled(),
        dragging: this.dragging(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            channel: state.channel,
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });

    constructor() {
        const host = injectHost();
        writeLabelledBy(host, [this.field.labelledBy, this.labelId]);
        // the `type="hidden"` input with the color as hex, after the consumer's children (as React
        // renders it); in the browser only, as Slider's (a server's would be a second one once the
        // page is hydrated)
        const browser = inject(PLATFORM_ID) === "browser";
        effect(() => {
            if (!browser) {
                return;
            }
            const hex = this.hex();
            const name = this.field.name() ?? this.name();
            untracked(() => {
                if (this.hidden === null) {
                    const element = host.ownerDocument.createElement("input");
                    element.type = "hidden";
                    element.setAttribute(
                        "data-primitives-part",
                        "color-slider-input",
                    );
                    host.appendChild(element);
                    this.hidden = element;
                }
                const hidden = this.hidden;
                if (name === undefined) {
                    hidden.removeAttribute("name");
                } else {
                    hidden.name = name;
                }
                hidden.value = hex;
            });
        });
        // a form reset: back to the default (spec/README.md, "Forms")
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            const hidden = this.hidden;
            if (hidden !== null) {
                stop = bridgeForm(hidden, {
                    reset: () => {
                        const next = toColor(untracked(this.defaultValue));
                        // no change reported when the slider already is at its default
                        if (!isSameColor(next, untracked(this.current.value))) {
                            this.field.reset();
                            this.current.set(next, { reason: "none" });
                        }
                    },
                });
            }
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            this.hidden?.remove();
        });
    }

    /** Sets the channel to `value` (snapped, clamped), reports it, returns the color. */
    setChannelValue(value: number, reason: ChangeReason): Color {
        const before = untracked(this.color);
        const channel = untracked(this.channel);
        const snapped = snapToStep(value, colorChannelRange(channel));
        if (snapped === getColorChannel(before, channel)) {
            return before;
        }
        const changed = setColorChannel(before, channel, snapped);
        this.current.set(changed, { reason });
        return changed;
    }

    /** Reports the color (default: the current one) as committed. */
    commit(color?: Color): void {
        this.valueCommit.emit(color ?? untracked(this.color));
    }
}
