import { InjectionToken } from "@angular/core";

/**
 * What a dialog's Popup gives the dialogs nested in it (spec/dialog.md, "Nested dialogs"): where
 * they report the open chain below them (`null` once they are gone).
 */
export interface DialogNesting {
    report: (dialog: object, chain: number | null) => void;
}

/** Provided by `[dialogPopup]`: a `[dialogRoot]` that finds it is nested. */
export const DIALOG_NESTING = new InjectionToken<DialogNesting>(
    "DialogNesting",
);
