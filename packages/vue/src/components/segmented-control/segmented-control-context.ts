import type { ComputedRef, InjectionKey, ShallowRef } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

/** An Item of the control, as it registered; each getter is read when it is needed. */
export interface SegmentedControlItemEntry {
    value: () => string;
    disabled: () => boolean;
    element: HTMLElement;
}

export interface SegmentedControlContext {
    /** The checked Item's value, `null` for none. */
    value: ComputedRef<string | null>;
    disabled: () => boolean;
    orientation: () => "horizontal" | "vertical";
    /** The value of the Item holding the tab stop, `null` for none. */
    tabStop: ComputedRef<string | null>;
    /** The Root's element, which the Indicator is measured from. */
    root: ShallowRef<HTMLElement | null>;
    /** The checked Item's element, once it registered. */
    checkedElement: ComputedRef<HTMLElement | null>;
    /** Checks an Item. */
    select: (value: string, reason: ChangeReason, event: Event) => void;
    /** An arrow key on an Item: moves the focus and the check (spec/segmented-control.md). */
    navigate: (key: string, from: HTMLElement, event: Event) => boolean;
    register: (entry: SegmentedControlItemEntry) => () => void;
}

export const SegmentedControlKey: InjectionKey<SegmentedControlContext> =
    Symbol("SegmentedControl");

/** An Item's state, which its ItemText reads. */
export interface SegmentedControlItemState {
    checked: boolean;
    disabled: boolean;
    orientation: "horizontal" | "vertical";
}

export const SegmentedControlItemKey: InjectionKey<
    ComputedRef<SegmentedControlItemState>
> = Symbol("SegmentedControlItem");
