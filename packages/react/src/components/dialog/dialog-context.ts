import { createContext } from "react";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";

/** The component a dialog's parts belong to: their part attribute's prefix. */
export type DialogComponent = "dialog" | "alert-dialog";

export interface DialogContextValue extends OverlayRoot {
    /** `alert-dialog`: never dismissed from outside, focuses its first Close (spec/alert-dialog.md). */
    component: DialogComponent;
    backdrop: HTMLElement | null;
    setBackdrop: (element: HTMLElement | null) => void;
    viewport: HTMLElement | null;
    setViewport: (element: HTMLElement | null) => void;
    titleId: string | undefined;
    setTitleId: (id: string | undefined) => void;
    descriptionId: string | undefined;
    setDescriptionId: (id: string | undefined) => void;
    /** Whether this dialog sits inside another dialog's Popup (spec/dialog.md, "Nested dialogs"). */
    nested: boolean;
    /** The number of open dialogs nested below this one, as a chain (`--nested-dialogs`). */
    nestedDialogs: number;
    /** What the Popup gives the dialogs nested in it. */
    nesting: DialogNesting;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

/** What a dialog's Popup gives the dialogs nested in it: where they report their open chain. */
export interface DialogNesting {
    /** Reports the open chain below one nested dialog (`null` once it is gone). */
    report: (id: string, chain: number | null) => void;
}

export const DialogNestingContext = createContext<DialogNesting | null>(null);
