import { defineLabelledPart } from "../../utils/labelled-part.ts";
import { DialogKey } from "./dialog-context.ts";

/** Names the dialog (its id becomes the popup's `aria-labelledby`). */
export const DialogTitle = defineLabelledPart(
    "DialogTitle",
    DialogKey,
    "h2",
    (c) => `${c.component}-title`,
    (c) => c.titleId,
);
