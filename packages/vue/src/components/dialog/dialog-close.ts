import { defineClosePart } from "../../utils/labelled-part.ts";
import { DialogKey } from "./dialog-context.ts";

/** Closes the dialog (reason `close-press`). */
export const DialogClose = defineClosePart(
    "DialogClose",
    DialogKey,
    "dialog-close",
);
