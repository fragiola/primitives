import { dialog } from "./dialog.ts";
import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/alert-dialog.md, "Anatomy": Dialog's parts, with a destructive action next to its Close
export const alertDialog: Recipe<
    | "trigger"
    | "backdrop"
    | "viewport"
    | "popup"
    | "title"
    | "description"
    | "close"
    | "actions"
    | "action"
> = {
    ...dialog,
    // the answers, at the end of the popup
    actions: "flex justify-end gap-2",
    // the app's own destructive answer: emphasized, with the palette's contrast
    action: `${BUTTON} border-palette-contrast bg-palette-contrast text-palette-base hover:bg-palette-contrast/90`,
};
