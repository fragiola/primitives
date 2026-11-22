import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface SliderContextValue {
    /** The enclosing field's binding, for the thumbs (spec/field.md). */
    field: FieldControlBinding;
    values: readonly number[];
    min: number;
    max: number;
    step: number;
    largeStep: number;
    minStepsBetweenValues: number;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
    /** The thumb a pointer drags (or last pressed), else -1. */
    activeIndex: number;
    /** Moves thumb `index` to `value` (snapped, within its bounds), reports it, returns the values. */
    setThumb: (
        index: number,
        value: number,
        reason: ChangeReason,
    ) => readonly number[];
    /** Reports the values (default: the current ones) as committed. */
    commit: (values?: readonly number[]) => void;
    control: HTMLElement | null;
    setControl: (element: HTMLElement | null) => void;
    root: HTMLElement | null;
    /** The thumbs, for the default `index` (their order) and focusing the moved one. */
    thumbs: readonly HTMLElement[];
    registerThumb: (
        element: HTMLElement | null,
        previous: HTMLElement | null,
    ) => void;
    startDragging: (index: number) => void;
    stopDragging: () => void;
    /** The Label's id, while one is rendered. */
    labelId: string | undefined;
    setLabelId: (id: string | undefined) => void;
    /** A value as the Value shows it: with `format`, `Intl.NumberFormat`'s; else `String(value)`. */
    formatValue: (value: number) => string;
    /** Whether the Root has a `format` (the thumbs' `aria-valuetext` then follows it). */
    formatted: boolean;
}

export const SliderContext = createContext<SliderContextValue | null>(null);

/** The state every slider part shares. */
export interface SliderState {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
}

export function sliderState(context: SliderContextValue): SliderState {
    return {
        orientation: context.orientation,
        disabled: context.disabled,
        dragging: context.dragging,
    };
}
