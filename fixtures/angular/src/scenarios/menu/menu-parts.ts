import {
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuPopup,
    MenuPortal,
    MenuPositioner,
    MenuRoot,
    MenuSeparator,
    MenuSubmenuTrigger,
    MenuTrigger,
} from "@fragiola/primitives-angular/menu";

/** Every Menu directive, for a scenario's `imports`. */
export const MENU_PARTS = [
    MenuRoot,
    MenuTrigger,
    MenuPortal,
    MenuPositioner,
    MenuPopup,
    MenuItem,
    MenuSeparator,
    MenuGroup,
    MenuGroupLabel,
    MenuSubmenuTrigger,
] as const;
