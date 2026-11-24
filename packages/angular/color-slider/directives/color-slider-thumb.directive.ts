import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    signal,
    untracked,
} from "@angular/core";
import { formatColor, setColorChannel } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { sliderKeyTarget, valueToPercent } from "@fragiola/primitives/range";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    dataValues,
    injectFlush,
    injectHost,
    injectId,
} from "@fragiola/primitives-angular/internal";
import { writeThumbLabelledBy } from "../utils/write-labelled-by.ts";
import { ColorSliderRoot } from "./color-slider-root.directive.ts";

/**
 * The `slider`: the channel's value (spec/color-slider.md): `<div colorSliderThumb>`. With no name
 * of its own (`aria-label`, `aria-labelledby`), the field's label or the slider's Label names it.
 */
@Directive({
    selector: "[colorSliderThumb]",
    exportAs: "colorSliderThumb",
    host: {
        role: "slider",
        "data-primitives-part": "color-slider-thumb",
        "[attr.id]": "resolvedId()",
        "[attr.tabindex]": "state().disabled ? null : 0",
        "[attr.aria-valuenow]": "state().value",
        "[attr.aria-valuemin]": "root.range().min",
        "[attr.aria-valuemax]": "root.range().max",
        "[attr.aria-valuetext]": "root.valueText()",
        "[attr.aria-orientation]": "state().orientation",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-channel]": "data().channel",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        "[style]": "style()",
        "[style.--color-slider-thumb-color]": "thumbColor()",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "root.field.blurred()",
    },
})
export class ColorSliderThumb {
    protected readonly root = inject(ColorSliderRoot);
    /** Its id (generated unless given): the Output's `for`. */
    readonly id = input<string | undefined>(undefined);
    readonly state = this.root.state;
    private readonly host = injectHost();
    private readonly generated = injectId("primitives-color-slider-thumb");
    protected readonly resolvedId = computed(() => this.id() ?? this.generated);
    private readonly flush = injectFlush();
    /** Rendered in the browser: the computed direction can be read (React reads it once mounted). */
    private readonly mounted = signal(false);
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            channel: state.channel,
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
    /** The color the recipe draws the thumb with: opaque, but on an alpha slider. */
    protected readonly thumbColor = computed(() => {
        const root = this.root;
        const color = root.color();
        return formatColor(
            root.channel() === "alpha"
                ? color
                : setColorChannel(color, "alpha", 1),
        );
    });
    /** Structural: the thumb's centre on its value. */
    protected readonly style = computed(() => {
        const root = this.root;
        const { min, max } = root.range();
        const percent = valueToPercent(root.channelValue(), min, max);
        if (root.orientation() === "vertical") {
            return {
                position: "absolute",
                "inset-block-end": `${percent}%`,
                left: "50%",
                translate: "-50% 50%",
            };
        }
        // the centring translate is physical: the layout's (computed) direction (Slider's Thumb)
        const rtl = this.mounted() && getDirection(this.host) === "rtl";
        return {
            position: "absolute",
            "inset-inline-start": `${percent}%`,
            top: "50%",
            translate: rtl ? "50% -50%" : "-50% -50%",
        };
    });

    constructor() {
        const root = this.root;
        root.thumb.set(this.host);
        afterNextRender(() => this.mounted.set(true));
        effect(() => {
            const id = this.resolvedId();
            untracked(() => root.thumbId.set(id));
        });
        inject(DestroyRef).onDestroy(() => {
            if (untracked(root.thumb) === this.host) {
                root.thumb.set(null);
                root.thumbId.set(undefined);
            }
        });
        const { field } = root;
        writeFieldAria(field, this.host, {
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        // the field's label, or the Label, names a thumb that has no name of its own, read live
        // (a bound or later `aria-label` wins)
        writeThumbLabelledBy(this.host, [field.labelledBy, root.labelId]);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        if (root.isDisabled()) {
            return;
        }
        const range = root.range();
        const target = sliderKeyTarget(
            event.key,
            event.shiftKey,
            root.channelValue(),
            {
                step: range.step,
                largeStep: range.largeStep,
                min: range.min,
                max: range.max,
                orientation: root.orientation(),
                rtl:
                    getDirection(this.host, root.providedDirection()) === "rtl",
            },
        );
        if (target === null) {
            return;
        }
        event.preventDefault();
        root.commit(root.setChannelValue(target, "keyboard"));
        // the new value before the next key
        this.flush();
    }
}
