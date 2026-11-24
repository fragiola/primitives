import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    inject,
    signal,
} from "@angular/core";
import { colorChannelGradient } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { startDrag } from "@fragiola/primitives/pointer";
import { fractionAlong, valueAtFraction } from "@fragiola/primitives/range";
import {
    dataValues,
    injectFlush,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { ColorSliderRoot } from "./color-slider-root.directive.ts";

/**
 * The interactive area and the channel's gradient (spec/color-slider.md, "Pointer"): a press
 * moves the thumb there, then drags it with pointer capture: `<div colorSliderTrack>`. Every move
 * renders within its event (`injectFlush`): zoneless Angular would render it a task later.
 */
@Directive({
    selector: "[colorSliderTrack]",
    exportAs: "colorSliderTrack",
    host: {
        "data-primitives-part": "color-slider-track",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-channel]": "data().channel",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        // structural: the thumb's box, no page scroll under a touch drag, the gradient a recipe
        // draws
        "[style.position]": "'relative'",
        "[style.touch-action]": "'none'",
        "[style.--color-slider-track-background]": "gradient()",
        "(pointerdown)": "onPointerDown($event)",
    },
})
export class ColorSliderTrack {
    private readonly root = inject(ColorSliderRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            channel: state.channel,
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
    private readonly host = injectHost();
    private readonly flush = injectFlush();
    /** Rendered in the browser: the computed direction can be read (React reads it once mounted). */
    private readonly mounted = signal(false);
    private endDrag: (() => void) | null = null;
    protected readonly gradient = computed(() => {
        const root = this.root;
        const provided = root.providedDirection();
        const rtl =
            provided !== null
                ? provided === "rtl"
                : this.mounted() && getDirection(this.host) === "rtl";
        return colorChannelGradient(
            root.color(),
            root.channel(),
            root.orientation() === "vertical"
                ? "to top"
                : rtl
                  ? "to left"
                  : "to right",
        );
    });

    constructor() {
        afterNextRender(() => this.mounted.set(true));
        inject(DestroyRef).onDestroy(() => this.endDrag?.());
    }

    private valueAt(x: number, y: number): number {
        const root = this.root;
        const fraction = fractionAlong(
            this.host.getBoundingClientRect(),
            { x, y },
            root.orientation(),
            getDirection(this.host, root.providedDirection()) === "rtl",
        );
        return valueAtFraction(fraction, root.range());
    }

    protected onPointerDown(event: PointerEvent): void {
        const root = this.root;
        if (
            root.isDisabled() ||
            (event.pointerType === "mouse" && event.button !== 0)
        ) {
            return;
        }
        event.preventDefault();
        root.setChannelValue(
            this.valueAt(event.clientX, event.clientY),
            "track-press",
        );
        root.thumb()?.focus();
        root.dragging.set(true);
        this.flush();
        this.endDrag?.();
        this.endDrag = startDrag(this.host, event, {
            onMove: (move) => {
                root.setChannelValue(
                    this.valueAt(move.clientX, move.clientY),
                    "drag",
                );
                this.flush();
            },
            onEnd: () => {
                this.endDrag = null;
                root.dragging.set(false);
                root.commit();
                this.flush();
            },
        });
    }
}
