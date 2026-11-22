import { defineLabelledPart } from "../../utils/labelled-part.ts";
import { PopoverKey } from "./popover-context.ts";

export const PopoverTitle = defineLabelledPart(
    "PopoverTitle",
    PopoverKey,
    "h2",
    "popover-title",
    (c) => c.titleId,
);
