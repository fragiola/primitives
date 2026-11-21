import { defineLabelledPart } from "../../utils/labelled-part.ts";
import { PopoverKey } from "./popover-context.ts";

export const PopoverDescription = defineLabelledPart(
    "PopoverDescription",
    PopoverKey,
    "p",
    "popover-description",
    (c) => c.descriptionId,
);
