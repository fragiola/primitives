import type { ComputedRef, InjectionKey } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

export type AccordionOrientation = "horizontal" | "vertical";

export interface AccordionRootState {
    value: string[];
    disabled: boolean;
    orientation: AccordionOrientation;
}

export interface AccordionContext {
    value: ComputedRef<readonly string[]>;
    /** Opens or closes an item (in single mode, opening one closes the open one). */
    toggle: (item: string, open: boolean, reason: ChangeReason) => void;
    disabled: () => boolean;
    orientation: () => AccordionOrientation;
    baseId: string;
}

export const AccordionKey: InjectionKey<AccordionContext> = Symbol("Accordion");

export interface AccordionItemState {
    open: boolean;
    disabled: boolean;
    orientation: AccordionOrientation;
}

export interface AccordionItemContext {
    state: ComputedRef<AccordionItemState>;
    triggerId: () => string;
    panelId: () => string;
    setOpen: (open: boolean, reason: ChangeReason) => void;
}

export const AccordionItemKey: InjectionKey<AccordionItemContext> =
    Symbol("AccordionItem");

// A value may hold any character: it is encoded, so the ids hold no whitespace
export const triggerId = (baseId: string, value: string) =>
    `${baseId}-trigger-${encodeURIComponent(value)}`;
export const panelId = (baseId: string, value: string) =>
    `${baseId}-panel-${encodeURIComponent(value)}`;

/** `data-open` / `data-closed` (exactly one) and `data-disabled` (spec/accordion.md). */
export function itemAttributes(state: { open: boolean; disabled: boolean }) {
    return {
        open: state.open,
        closed: !state.open,
        disabled: state.disabled,
    };
}
