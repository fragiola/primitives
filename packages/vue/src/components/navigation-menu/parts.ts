import { NavigationMenuArrow } from "./navigation-menu-arrow.ts";
import { NavigationMenuBackdrop } from "./navigation-menu-backdrop.ts";
import { NavigationMenuContent } from "./navigation-menu-content.ts";
import { NavigationMenuIcon } from "./navigation-menu-icon.ts";
import { NavigationMenuItem } from "./navigation-menu-item.ts";
import { NavigationMenuLink } from "./navigation-menu-link.ts";
import { NavigationMenuList } from "./navigation-menu-list.ts";
import { NavigationMenuPopup } from "./navigation-menu-popup.ts";
import { NavigationMenuPortal } from "./navigation-menu-portal.ts";
import { NavigationMenuPositioner } from "./navigation-menu-positioner.ts";
import { NavigationMenuRoot } from "./navigation-menu-root.ts";
import { NavigationMenuTrigger } from "./navigation-menu-trigger.ts";
import { NavigationMenuViewport } from "./navigation-menu-viewport.ts";

/** spec/navigation-menu.md */
export const NavigationMenu = {
    Root: NavigationMenuRoot,
    List: NavigationMenuList,
    Item: NavigationMenuItem,
    Trigger: NavigationMenuTrigger,
    Icon: NavigationMenuIcon,
    Content: NavigationMenuContent,
    Link: NavigationMenuLink,
    Portal: NavigationMenuPortal,
    Backdrop: NavigationMenuBackdrop,
    Positioner: NavigationMenuPositioner,
    Popup: NavigationMenuPopup,
    Viewport: NavigationMenuViewport,
    Arrow: NavigationMenuArrow,
};
