import { defineClosePart } from "../../utils/labelled-part.ts";
import { PopoverKey } from "./popover-context.ts";

export const PopoverClose = defineClosePart(
    "PopoverClose",
    PopoverKey,
    "popover-close",
);
