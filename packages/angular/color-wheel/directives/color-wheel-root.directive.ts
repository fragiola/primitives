import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked,
} from "@angular/core";
import {
    type Color,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    hueAtPoint,
    isOnColorWheel,
    isSameColor,
    parseColor,
    setColorChannel,
    wrapHue,
} from "@fragiola/primitives/color";
import { bridgeForm } from "@fragiola/primitives/form";
import { startDrag } from "@fragiola/primitives/pointer";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectFlush,
    injectHost,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** The state every color wheel part shares. */
export interface ColorWheelState {
    /** The value, in the wheel's space. */
    color: Color;
    hue: number;
    disabled: boolean;
    dragging: boolean;
}

const RED: Color = {
    space: "hsl",
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 1,
};

/** A `Color`, or a string `parseColor` reads (the default when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? RED;
}

/**
 * Holds a color wheel's value: the interactive square around the ring, and the hidden input with
 * the color as hex at its end (spec/color-wheel.md, the APG slider on a ring):
 * `<div colorWheelRoot [(value)]="color" name="color">` around its Track and Thumb.
 */
@Directive({
    selector: "[colorWheelRoot]",
    exportAs: "colorWheelRoot",
    host: {
        "data-primitives-part": "color-wheel-root",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        // structural: the square around the ring, no page scroll under a touch drag, the radii a
        // recipe's ring mask reads
        "[style.position]": "'relative'",
        "[style.inline-size]": "size()",
        "[style.block-size]": "size()",
        "[style.touch-action]": "'none'",
        "[style.--color-wheel-outer-radius]": "outerRadius() + 'px'",
        "[style.--color-wheel-inner-radius]": "innerRadius() + 'px'",
        "(pointerdown)": "onPointerDown($event)",
    },
})
export class ColorWheelRoot {
    /** A `Color`, or a string `parseColor` reads; bound, the wheel is controlled. */
    readonly value = input<Color | string | undefined>(undefined);
    readonly valueChange = output<Color>();
    readonly defaultValue = input<Color | string>(RED);
    readonly valueChangeDetails = output<ValueChangeEvent<Color>>();
    /** When a drag ends, or after a key changed the value. */
    readonly valueCommit = output<Color>();
    /** The space of the hue (default: the value's, else hsb). */
    readonly colorSpace = input<"hsl" | "hsb" | undefined>(undefined);
    /** The ring's outer radius, in px (default 100). */
    readonly outerRadius = input(100, { transform: numberAttribute });
    /** The ring's inner radius, in px (default 75). */
    readonly innerRadius = input(75, { transform: numberAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The locale of the hue's text (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);

    private readonly host = injectHost();
    private readonly flush = injectFlush();
    private readonly current = controllable<Color, ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toColor(value);
        }),
        this.valueChange,
        () => toColor(this.defaultValue()),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The value, in the wheel's space (hsl or hsb). */
    readonly color = computed(() => {
        const current = this.current.value();
        return convertColor(
            current,
            colorSpaceFor("hue", current, this.colorSpace()),
        );
    });
    readonly hue = computed(() => getColorChannel(this.color(), "hue"));
    private readonly hex = computed(() => formatColor(this.color(), "hex"));
    /** The hue's text (`Intl`, spec/color.md): the Thumb's `aria-valuetext`. */
    readonly valueText = computed(() =>
        formatColorChannel(this.color(), "hue", this.locale(), this.hue()),
    );
    readonly dragging = signal(false);
    /** The Thumb, while one is rendered. */
    readonly thumb = signal<HTMLElement | null>(null);
    readonly isDisabled = computed(() => this.disabled());
    protected readonly size = computed(() => `${this.outerRadius() * 2}px`);
    readonly state = computed<ColorWheelState>(() => ({
        color: this.color(),
        hue: this.hue(),
        disabled: this.isDisabled(),
        dragging: this.dragging(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
    /** The hidden input, once created (in the browser). */
    private hidden: HTMLInputElement | null = null;
    private endDrag: (() => void) | null = null;

    constructor() {
        const host = this.host;
        // the `type="hidden"` input with the color as hex, after the consumer's children (as React
        // renders it); in the browser only (a server's would be a second one once hydrated)
        const browser = inject(PLATFORM_ID) === "browser";
        effect(() => {
            if (!browser) {
                return;
            }
            const hex = this.hex();
            const name = this.name();
            untracked(() => {
                if (this.hidden === null) {
                    const element = host.ownerDocument.createElement("input");
                    element.type = "hidden";
                    element.setAttribute(
                        "data-primitives-part",
                        "color-wheel-input",
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
        // a form reset returns the wheel to its default (spec/color-wheel.md, "Forms")
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            const hidden = this.hidden;
            if (hidden !== null) {
                stop = bridgeForm(hidden, {
                    reset: () => {
                        const next = toColor(untracked(this.defaultValue));
                        if (!isSameColor(next, untracked(this.current.value))) {
                            this.current.set(next, { reason: "none" });
                        }
                    },
                });
            }
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            this.endDrag?.();
            this.hidden?.remove();
        });
    }

    /** Sets the hue (wrapped into [0, 360), snapped), reports it, returns the color. */
    setHue(hue: number, reason: ChangeReason): Color {
        const before = untracked(this.color);
        const wrapped = wrapHue(hue);
        if (wrapped === getColorChannel(before, "hue")) {
            return before;
        }
        const changed = setColorChannel(before, "hue", wrapped);
        this.current.set(changed, { reason });
        return changed;
    }

    /** Reports the color (default: the current one) as committed. */
    commit(color?: Color): void {
        this.valueCommit.emit(color ?? untracked(this.color));
    }

    protected onPointerDown(event: PointerEvent): void {
        if (
            untracked(this.isDisabled) ||
            (event.pointerType === "mouse" && event.button !== 0)
        ) {
            return;
        }
        const host = this.host;
        const point = { x: event.clientX, y: event.clientY };
        const box = host.getBoundingClientRect();
        // a press off the ring does nothing (spec/color-wheel.md, "Pointer")
        if (
            !isOnColorWheel(
                box,
                point,
                untracked(this.innerRadius),
                untracked(this.outerRadius),
            )
        ) {
            return;
        }
        event.preventDefault();
        this.setHue(hueAtPoint(box, point), "track-press");
        untracked(this.thumb)?.focus();
        this.dragging.set(true);
        this.flush();
        this.endDrag?.();
        this.endDrag = startDrag(host, event, {
            onMove: (move) => {
                this.setHue(
                    hueAtPoint(host.getBoundingClientRect(), {
                        x: move.clientX,
                        y: move.clientY,
                    }),
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
