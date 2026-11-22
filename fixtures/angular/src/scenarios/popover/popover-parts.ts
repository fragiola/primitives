import {
    PopoverArrow,
    PopoverClose,
    PopoverDescription,
    PopoverPopup,
    PopoverPortal,
    PopoverPositioner,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
} from "@fragiola/primitives-angular/popover";

/** Every Popover directive, for a scenario's `imports`. */
export const POPOVER_PARTS = [
    PopoverRoot,
    PopoverTrigger,
    PopoverPortal,
    PopoverPositioner,
    PopoverPopup,
    PopoverArrow,
    PopoverTitle,
    PopoverDescription,
    PopoverClose,
] as const;
