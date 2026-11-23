import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

/** An Item of the control, as it registered (spec/segmented-control.md). */
export interface SegmentedControlItemEntry {
    value: string;
    disabled: boolean;
    element: HTMLElement;
}

export interface SegmentedControlContextValue {
    /** The checked Item's value, `null` for none. */
    value: string | null;
    disabled: boolean;
    orientation: "horizontal" | "vertical";
    /** The value of the Item holding the tab stop, `null` for none. */
    tabStop: string | null;
    /** The Root's element, which the Indicator is measured from. */
    root: HTMLElement | null;
    /** The checked Item's element, once it registered. */
    checkedElement: HTMLElement | null;
    /** Checks an Item. */
    select: (value: string, reason: ChangeReason, event: Event) => void;
    /** An arrow key on an Item: moves the focus and the check (spec/segmented-control.md). */
    navigate: (key: string, from: HTMLElement, event: Event) => boolean;
    register: (entry: SegmentedControlItemEntry) => () => void;
}

export const SegmentedControlContext =
    createContext<SegmentedControlContextValue | null>(null);

/** An Item's state, which its ItemText reads. */
export interface SegmentedControlItemState {
    checked: boolean;
    disabled: boolean;
    orientation: "horizontal" | "vertical";
}

export const SegmentedControlItemContext =
    createContext<SegmentedControlItemState | null>(null);
