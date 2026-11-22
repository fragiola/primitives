import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

/** The component a dialog's parts belong to: their part attribute's prefix. */
export type DialogComponent = "dialog" | "alert-dialog";

export interface DialogContext extends OverlayRoot {
    /** `alert-dialog`: never dismissed from outside, focuses its first Close (spec/alert-dialog.md). */
    component: DialogComponent;
    backdrop: ShallowRef<HTMLElement | null>;
    viewport: ShallowRef<HTMLElement | null>;
    titleId: Ref<string | undefined>;
    descriptionId: Ref<string | undefined>;
    /** Whether this dialog sits inside another dialog's Popup (spec/dialog.md, "Nested dialogs"). */
    nested: boolean;
    /** The number of open dialogs nested below this one, as a chain (`--nested-dialogs`). */
    nestedDialogs: ComputedRef<number>;
    /** What the Popup gives the dialogs nested in it. */
    nesting: DialogNesting;
}

export const DialogKey: InjectionKey<DialogContext> = Symbol("Dialog");

/** What a dialog's Popup gives the dialogs nested in it: where they report their open chain. */
export interface DialogNesting {
    /** Reports the open chain below one nested dialog (`null` once it is gone). */
    report: (id: symbol, chain: number | null) => void;
}

export const DialogNestingKey: InjectionKey<DialogNesting> =
    Symbol("DialogNesting");
