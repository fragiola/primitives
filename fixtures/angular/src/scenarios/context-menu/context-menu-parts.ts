import {
    ContextMenuItem,
    ContextMenuPopup,
    ContextMenuPortal,
    ContextMenuPositioner,
    ContextMenuRoot,
    ContextMenuSeparator,
    ContextMenuSubmenuRoot,
    ContextMenuSubmenuTrigger,
    ContextMenuTrigger,
} from "@fragiola/primitives-angular/context-menu";

/** The ContextMenu directives the scenarios use, for their `imports`. */
export const CONTEXT_MENU_PARTS = [
    ContextMenuRoot,
    ContextMenuTrigger,
    ContextMenuPortal,
    ContextMenuPositioner,
    ContextMenuPopup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSubmenuRoot,
    ContextMenuSubmenuTrigger,
] as const;
