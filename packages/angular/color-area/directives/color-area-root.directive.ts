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
    type ColorChannel,
    type ColorSpace,
    colorAreaBackground,
    colorAreaChannels,
    colorChannelRange,
    convertColor,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { bridgeForm } from "@fragiola/primitives/form";
import { startDrag } from "@fragiola/primitives/pointer";
import {
    fractionAlong,
    snapToStep,
    valueAtFraction,
} from "@fragiola/primitives/range";
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

/** A ColorArea Input's axis. */
export type ColorAreaAxis = "x" | "y";

/** The state every color area part shares. */
export interface ColorAreaState {
    /** The value, in the area's space. */
    color: Color;
    xChannel: ColorChannel;
    yChannel: ColorChannel;
    disabled: boolean;
    dragging: boolean;
}

const WHITE_HUE: Color = {
    space: "hsb",
    hue: 0,
    saturation: 100,
    brightness: 100,
    alpha: 1,
};

/** A `Color`, or a string `parseColor` reads (the default when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? WHITE_HUE;
}

/**
 * Holds a color area's value: the `group` the consumer names, the interactive area and its
 * background (spec/color-area.md: two APG sliders, one native range input per axis):
 * `<div colorAreaRoot aria-label="Color" [(value)]="color">` around its Thumb and the consumer's
 * two `<input colorAreaInput axis="x">` and `axis="y"`.
 */
@Directive({
    selector: "[colorAreaRoot]",
    exportAs: "colorAreaRoot",
    host: {
        role: "group",
        "data-primitives-part": "color-area-root",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        // structural: the thumb's box, no page scroll under a touch drag, the background a recipe
        // draws
        "[style.position]": "'relative'",
        "[style.touch-action]": "'none'",
        "[style.--color-area-background]": "background().backgroundImage",
        "[style.--color-area-background-blend-mode]":
            "background().backgroundBlendMode",
        "(pointerdown)": "onPointerDown($event)",
    },
})
export class ColorAreaRoot {
    /** A `Color`, or a string `parseColor` reads; bound, the area is controlled. */
    readonly value = input<Color | string | undefined>(undefined);
    readonly valueChange = output<Color>();
    readonly defaultValue = input<Color | string | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<Color>>();
    /** When a drag ends, or after a key changed the value. */
    readonly valueCommit = output<Color>();
    readonly xChannel = input<ColorChannel | undefined>(undefined);
    readonly yChannel = input<ColorChannel | undefined>(undefined);
    readonly colorSpace = input<ColorSpace | undefined>(undefined);
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The locale of the channels' text (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);

    private readonly host = injectHost();
    private readonly flush = injectFlush();
    private readonly own = controllable<Color, ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toColor(value);
        }),
        this.valueChange,
        () => toColor(this.defaultValue() ?? WHITE_HUE),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );

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
    /** The value: the picker's when bound, else its own. */
    private readonly current = {
        value: computed(() => {
            const bound = this.bound();
            return bound === null ? this.own.value() : bound.value();
        }),
        set: (next: Color, details: ChangeDetails) => {
            const bound = untracked(this.bound);
            if (bound === null) {
                this.own.set(next, details);
                return;
            }
            this.valueChange.emit(next);
            this.valueChangeDetails.emit({ value: next, details });
            bound.setValue(next, details);
        },
    };
    /** The space and the channels of the two axes (`colorAreaChannels`). */
    readonly channels = computed(() =>
        colorAreaChannels(this.current.value(), {
            xChannel: this.xChannel(),
            yChannel: this.yChannel(),
            colorSpace: this.colorSpace(),
        }),
    );
    /** The value, in the area's space. */
    readonly color = computed(() =>
        convertColor(this.current.value(), this.channels().space),
    );
    readonly xValue = computed(() =>
        getColorChannel(this.color(), this.channels().xChannel),
    );
    readonly yValue = computed(() =>
        getColorChannel(this.color(), this.channels().yChannel),
    );
    readonly xRange = computed(() =>
        colorChannelRange(this.channels().xChannel),
    );
    readonly yRange = computed(() =>
        colorChannelRange(this.channels().yChannel),
    );
    readonly dragging = signal(false);
    /** The axis whose Input is the tab stop (the last focused, x at first). */
    readonly activeAxis = signal<ColorAreaAxis>("x");
    /** The Inputs, by axis, while they are rendered. */
    readonly inputs = signal<
        Readonly<Record<ColorAreaAxis, HTMLInputElement | null>>
    >({ x: null, y: null });
    readonly isDisabled = computed(
        () => this.disabled() || (this.picker?.disabled() ?? false),
    );
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    readonly providedDirection = injectProvidedDirection();
    /** Rendered in the browser: the computed direction can be read (React reads it once mounted). */
    private readonly mounted = signal(false);
    protected readonly background = computed(() => {
        const provided = this.providedDirection();
        const rtl =
            provided !== null
                ? provided === "rtl"
                : this.mounted() && getDirection(this.host) === "rtl";
        const { xChannel, yChannel } = this.channels();
        return colorAreaBackground(this.color(), xChannel, yChannel, rtl);
    });
    readonly state = computed<ColorAreaState>(() => {
        const { xChannel, yChannel } = this.channels();
        return {
            color: this.color(),
            xChannel,
            yChannel,
            disabled: this.isDisabled(),
            dragging: this.dragging(),
        };
    });
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
    private endDrag: (() => void) | null = null;

    constructor() {
        afterNextRender(() => this.mounted.set(true));
        // a form reset returns the area to its default (spec/color-area.md, "Forms"), through the
        // first Input
        afterRenderEffect((onCleanup) => {
            const { x, y } = this.inputs();
            const first = x ?? y;
            if (first === null) {
                return;
            }
            const stop = bridgeForm(first, {
                reset: () => {
                    // a bound control is reset by its picker
                    if (untracked(this.bound) !== null) {
                        this.writeInputs();
                        return;
                    }
                    const next = toColor(
                        untracked(this.defaultValue) ?? WHITE_HUE,
                    );
                    if (!isSameColor(next, untracked(this.current.value))) {
                        this.current.set(next, { reason: "none" });
                    }
                    this.flush();
                    // the browser reset the inputs after the state: write the state back
                    this.writeInputs();
                },
            });
            onCleanup(stop);
        });
        inject(DestroyRef).onDestroy(() => this.endDrag?.());
    }

    /** Sets the axes given (snapped, clamped), reports the change, returns the color. */
    setValues(values: { x?: number; y?: number }, reason: ChangeReason): Color {
        const before = untracked(this.color);
        const { xChannel, yChannel } = untracked(this.channels);
        let next = before;
        if (values.x !== undefined) {
            next = setColorChannel(
                next,
                xChannel,
                snapToStep(values.x, colorChannelRange(xChannel)),
            );
        }
        if (values.y !== undefined) {
            next = setColorChannel(
                next,
                yChannel,
                snapToStep(values.y, colorChannelRange(yChannel)),
            );
        }
        if (isSameColor(next, before)) {
            return before;
        }
        this.current.set(next, { reason });
        return next;
    }

    /** Reports the color (default: the current one) as committed. */
    commit(color?: Color): void {
        const committed = color ?? untracked(this.color);
        this.valueCommit.emit(committed);
        untracked(this.bound)?.commit(committed, { reason: "none" });
    }

    /** Registers an axis's Input; returns its unregistration. */
    registerInput(axis: ColorAreaAxis, element: HTMLInputElement): () => void {
        this.inputs.update((list) =>
            list[axis] === element ? list : { ...list, [axis]: element },
        );
        return () =>
            this.inputs.update((list) =>
                list[axis] === element ? { ...list, [axis]: null } : list,
            );
    }

    /** Writes each Input's value from the state (after the browser changed it). */
    writeInputs(): void {
        const { x, y } = untracked(this.inputs);
        const xValue = String(untracked(this.xValue));
        const yValue = String(untracked(this.yValue));
        if (x !== null && x.value !== xValue) {
            x.value = xValue;
        }
        if (y !== null && y.value !== yValue) {
            y.value = yValue;
        }
    }

    private valuesAt(
        clientX: number,
        clientY: number,
    ): { x: number; y: number } {
        const box = this.host.getBoundingClientRect();
        const point = { x: clientX, y: clientY };
        const { xChannel, yChannel } = untracked(this.channels);
        return {
            x: valueAtFraction(
                fractionAlong(
                    box,
                    point,
                    "horizontal",
                    getDirection(this.host, this.providedDirection()) === "rtl",
                ),
                colorChannelRange(xChannel),
            ),
            y: valueAtFraction(
                fractionAlong(box, point, "vertical", false),
                colorChannelRange(yChannel),
            ),
        };
    }

    protected onPointerDown(event: PointerEvent): void {
        if (
            untracked(this.isDisabled) ||
            (event.pointerType === "mouse" && event.button !== 0)
        ) {
            return;
        }
        event.preventDefault();
        this.setValues(
            this.valuesAt(event.clientX, event.clientY),
            "track-press",
        );
        const list = untracked(this.inputs);
        (list[untracked(this.activeAxis)] ?? list.x)?.focus();
        this.dragging.set(true);
        this.flush();
        this.endDrag?.();
        this.endDrag = startDrag(this.host, event, {
            onMove: (move) => {
                this.setValues(
                    this.valuesAt(move.clientX, move.clientY),
                    "drag",
                );
                this.flush();
            },
            onEnd: () => {
                this.endDrag = null;
                this.dragging.set(false);
                this.commit();
                this.flush();
            },
        });
    }
}
