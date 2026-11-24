import {
    computed,
    DestroyRef,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import {
    colorWheelKeyTarget,
    colorWheelThumbOffset,
    formatColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import {
    dataValues,
    injectFlush,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { ColorWheelRoot } from "./color-wheel-root.directive.ts";

/**
 * The `slider`: the hue, on the ring's middle circle (spec/color-wheel.md):
 * `<div colorWheelThumb aria-label="Hue">`.
 */
@Directive({
    selector: "[colorWheelThumb]",
    exportAs: "colorWheelThumb",
    host: {
        role: "slider",
        "data-primitives-part": "color-wheel-thumb",
        "[attr.tabindex]": "state().disabled ? null : 0",
        "[attr.aria-valuenow]": "state().hue",
        "aria-valuemin": "0",
        "aria-valuemax": "360",
        "[attr.aria-valuetext]": "root.valueText()",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        // structural: its centre on the hue's point of the ring, and its color for the recipe
        "[style]": "style()",
        "[style.--color-wheel-thumb-color]": "thumbColor()",
        "(keydown)": "onKeyDown($event)",
    },
})
export class ColorWheelThumb {
    protected readonly root = inject(ColorWheelRoot);
    readonly state = this.root.state;
    private readonly host = injectHost();
    private readonly flush = injectFlush();
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
    protected readonly thumbColor = computed(() =>
        formatColor(setColorChannel(this.root.color(), "alpha", 1)),
    );
    protected readonly style = computed(() => {
        const root = this.root;
        const offset = colorWheelThumbOffset(
            root.hue(),
            (root.innerRadius() + root.outerRadius()) / 2,
        );
        return {
            position: "absolute",
            left: `calc(50% + ${offset.x}px)`,
            top: `calc(50% + ${offset.y}px)`,
            translate: "-50% -50%",
        };
    });

    constructor() {
        const root = this.root;
        root.thumb.set(this.host);
        inject(DestroyRef).onDestroy(() => {
            if (untracked(root.thumb) === this.host) {
                root.thumb.set(null);
            }
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        if (root.isDisabled()) {
            return;
        }
        const target = colorWheelKeyTarget(
            event.key,
            event.shiftKey,
            root.hue(),
        );
        if (target === null) {
            return;
        }
        event.preventDefault();
        root.commit(root.setHue(target, "keyboard"));
        // the new value before the next key
        this.flush();
    }
}
