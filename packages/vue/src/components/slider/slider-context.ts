import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface SliderContext {
    /** The enclosing field's binding, for the thumbs (spec/field.md). */
    field: FieldControlBinding;
    values: ComputedRef<readonly number[]>;
    min: () => number;
    max: () => number;
    step: () => number;
    largeStep: () => number;
    minStepsBetweenValues: () => number;
    orientation: () => "horizontal" | "vertical";
    disabled: () => boolean;
    dragging: Ref<boolean>;
    /** The thumb a pointer drags (or last pressed), else -1. */
    activeIndex: Ref<number>;
    /** Moves thumb `index` to `value` (snapped, within its bounds), reports it, returns the values. */
    setThumb: (
        index: number,
        value: number,
        reason: ChangeReason,
    ) => readonly number[];
    /** Reports the values (default: the current ones) as committed. */
    commit: (values?: readonly number[]) => void;
    /** The thumbs in document order, for the default `index` and focusing the moved one. */
    thumbs: ShallowRef<readonly HTMLElement[]>;
    registerThumb: (element: HTMLElement) => () => void;
    /**
     * The thumbs' ids, in the order their parts were set up (document order), with their
     * `index` when they have one: the Value's `for`. Set up before the Value renders, on a
     * server too.
     */
    thumbIds: ShallowRef<readonly SliderThumbId[]>;
    registerThumbId: (entry: SliderThumbId) => () => void;
    /** The rendered Label's id: it names the Root and the thumbs with no name of their own. */
    labelId: Ref<string | undefined>;
    /** A value as the Value shows it: formatted with `format`, else the plain number. */
    formatValue: (value: number) => string;
    /** Whether the Root has a `format` (the thumbs' `aria-valuetext` then follows it). */
    formatted: () => boolean;
}

/** A thumb's id for the Value's `for`. */
export interface SliderThumbId {
    id: () => string;
    index: () => number | undefined;
}

export const SliderKey: InjectionKey<SliderContext> = Symbol("Slider");

/** The state every slider part shares. */
export interface SliderState {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
}

export function sliderState(context: SliderContext): SliderState {
    return {
        orientation: context.orientation(),
        disabled: context.disabled(),
        dragging: context.dragging.value,
    };
}
