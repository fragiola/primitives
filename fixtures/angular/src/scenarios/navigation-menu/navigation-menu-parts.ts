import {
    NavigationMenuArrow,
    NavigationMenuBackdrop,
    NavigationMenuContent,
    NavigationMenuIcon,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuPopup,
    NavigationMenuPortal,
    NavigationMenuPositioner,
    NavigationMenuRoot,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@fragiola/primitives-angular/navigation-menu";

/** Every NavigationMenu directive, for a scenario's `imports`. */
export const NAVIGATION_MENU_PARTS = [
    NavigationMenuRoot,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuIcon,
    NavigationMenuContent,
    NavigationMenuLink,
    NavigationMenuPortal,
    NavigationMenuBackdrop,
    NavigationMenuPositioner,
    NavigationMenuPopup,
    NavigationMenuViewport,
    NavigationMenuArrow,
] as const;
