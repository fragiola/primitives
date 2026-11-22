import {
    SelectGroup,
    SelectGroupLabel,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectList,
    SelectPopup,
    SelectPortal,
    SelectPositioner,
    SelectRoot,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@fragiola/primitives-angular/select";

/** Every Select directive, for a scenario's `imports`. */
export const SELECT_PARTS = [
    SelectRoot,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    SelectPortal,
    SelectPositioner,
    SelectPopup,
    SelectList,
    SelectItem,
    SelectItemText,
    SelectItemIndicator,
    SelectGroup,
    SelectGroupLabel,
    SelectSeparator,
] as const;
