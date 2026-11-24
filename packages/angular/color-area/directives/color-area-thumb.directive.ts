import {
    afterNextRender,
    computed,
    Directive,
    inject,
    signal,
} from "@angular/core";
import { formatColor, setColorChannel } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { valueToPercent } from "@fragiola/primitives/range";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import { ColorAreaRoot } from "./color-area-root.directive.ts";

/** Marks the area's point and holds its Inputs (spec/color-area.md): `<div colorAreaThumb>`. */
@Directive({
    selector: "[colorAreaThumb]",
    exportAs: "colorAreaThumb",
    host: {
        "data-primitives-part": "color-area-thumb",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        // structural: its centre on the point, and its color for the recipe
        "[style]": "style()",
        "[style.--color-area-thumb-color]": "thumbColor()",
    },
})
export class ColorAreaThumb {
    private readonly root = inject(ColorAreaRoot);
    readonly state = this.root.state;
    private readonly host = injectHost();
    /** Rendered in the browser: the computed direction can be read (React reads it once mounted). */
    private readonly mounted = signal(false);
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
        const xRange = root.xRange();
        const yRange = root.yRange();
        const x = valueToPercent(root.xValue(), xRange.min, xRange.max);
        const y = valueToPercent(root.yValue(), yRange.min, yRange.max);
        // the centring translate is physical: the layout's (computed) direction (Slider's Thumb)
        const rtl = this.mounted() && getDirection(this.host) === "rtl";
        return {
            position: "absolute",
            "inset-inline-start": `${x}%`,
            "inset-block-end": `${y}%`,
            translate: rtl ? "50% 50%" : "-50% 50%",
        };
    });

    constructor() {
        afterNextRender(() => this.mounted.set(true));
    }
}
