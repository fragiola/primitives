import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    untracked,
} from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import {
    sliderKeyTarget,
    thumbBounds,
    valueToPercent,
} from "@fragiola/primitives/range";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    dataValues,
    injectFlush,
    injectHost,
    injectId,
} from "@fragiola/primitives-angular/internal";
import { writeThumbLabelledBy } from "../utils/write-labelled-by.ts";
import { SliderRoot } from "./slider-root.directive.ts";

export interface SliderThumbState {
    value: number;
    index: number;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
}

/**
 * A `slider`: one value of the slider (spec/slider.md): `<div sliderThumb aria-label="Volume">`.
 * With no name of its own, the field's label or the slider's Label names it.
 */
@Directive({
    selector: "[sliderThumb]",
    exportAs: "sliderThumb",
    host: {
        role: "slider",
        "data-primitives-part": "slider-thumb",
        "[attr.id]": "resolvedId()",
        "[attr.tabindex]": "state().disabled ? null : 0",
        "[attr.aria-valuenow]": "state().value",
        "[attr.aria-valuemin]": "bounds().min",
        "[attr.aria-valuemax]": "bounds().max",
        "[attr.aria-valuetext]": "valueText()",
        "[attr.aria-orientation]": "state().orientation",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-index]": "data().index",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        "[style]": "style()",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "root.field.blurred()",
    },
})
export class SliderThumb {
    private readonly root = inject(SliderRoot);
    /** Its value's index (default: its order among the thumbs). */
    readonly index = input<number | undefined>(undefined);
    /** The text for `aria-valuetext`. */
    readonly getAriaValueText = input<
        ((value: number, index: number) => string) | undefined
    >(undefined);
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Its id (generated unless given): the Value's `for` lists it. */
    readonly id = input<string | undefined>(undefined);
    private readonly host = injectHost();
    private readonly generated = injectId("primitives-slider-thumb");
    protected readonly resolvedId = computed(() => this.id() ?? this.generated);
    private readonly flush = injectFlush();
    private readonly position = computed(
        () =>
            this.index() ?? Math.max(this.root.thumbs().indexOf(this.host), 0),
    );
    readonly state = computed<SliderThumbState>(() => {
        const root = this.root;
        const index = this.position();
        return {
            value: root.values()[index] ?? root.min(),
            index,
            orientation: root.orientation(),
            disabled: this.disabled() || root.isDisabled(),
            dragging: root.dragging() && root.activeIndex() === index,
        };
    });
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            index: String(state.index),
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
    protected readonly bounds = computed(() => {
        const root = this.root;
        return thumbBounds(root.values(), this.position(), {
            min: root.min(),
            max: root.max(),
            step: root.step(),
            minStepsBetweenValues: root.minStepsBetweenValues(),
        });
    });
    protected readonly valueText = computed(() => {
        const state = this.state();
        const own = this.getAriaValueText();
        return own === undefined
            ? this.root.valueText(state.value)
            : own(state.value, state.index);
    });
    /** Structural: the thumb's centre on its value. */
    protected readonly style = computed(() => {
        const root = this.root;
        const percent = valueToPercent(
            this.state().value,
            root.min(),
            root.max(),
        );
        if (root.orientation() === "vertical") {
            return {
                position: "absolute",
                "inset-block-end": `${percent}%`,
                left: "50%",
                translate: "-50% 50%",
            };
        }
        const rtl = getDirection(this.host) === "rtl";
        return {
            position: "absolute",
            "inset-inline-start": `${percent}%`,
            top: "50%",
            translate: rtl ? "50% -50%" : "-50% -50%",
        };
    });

    constructor() {
        inject(DestroyRef).onDestroy(this.root.registerThumb(this.host));
        const { field } = this.root;
        writeFieldAria(field, this.host, {
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        // the field's label, or the Label, names a thumb that has no name of its own, read live
        // (a bound or later `aria-label` wins)
        writeThumbLabelledBy(this.host, [field.labelledBy, this.root.labelId]);
        // its id by its value's index, for the Value's `for`
        effect((onCleanup) => {
            const index = this.position();
            const id = this.resolvedId();
            untracked(() => {
                this.root.thumbIds.update((ids) => ({ ...ids, [index]: id }));
                onCleanup(() =>
                    this.root.thumbIds.update((ids) => {
                        const { [index]: _, ...rest } = ids;
                        return rest;
                    }),
                );
            });
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const state = this.state();
        if (state.disabled) {
            return;
        }
        const root = this.root;
        const bounds = this.bounds();
        const target = sliderKeyTarget(event.key, event.shiftKey, state.value, {
            step: root.step(),
            largeStep: root.largeStep(),
            min: bounds.min,
            max: bounds.max,
            orientation: root.orientation(),
            rtl: getDirection(this.host, root.providedDirection()) === "rtl",
        });
        if (target === null) {
            return;
        }
        event.preventDefault();
        root.commit(root.setThumb(state.index, target, "keyboard"));
        // the new value before the next key
        this.flush();
    }
}
