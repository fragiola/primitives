import { NavigationMenuArrow } from "./navigation-menu-arrow.tsx";
import { NavigationMenuBackdrop } from "./navigation-menu-backdrop.tsx";
import { NavigationMenuContent } from "./navigation-menu-content.tsx";
import { NavigationMenuIcon } from "./navigation-menu-icon.tsx";
import { NavigationMenuItem } from "./navigation-menu-item.tsx";
import { NavigationMenuLink } from "./navigation-menu-link.tsx";
import { NavigationMenuList } from "./navigation-menu-list.tsx";
import { NavigationMenuPopup } from "./navigation-menu-popup.tsx";
import { NavigationMenuPortal } from "./navigation-menu-portal.tsx";
import { NavigationMenuPositioner } from "./navigation-menu-positioner.tsx";
import { NavigationMenuRoot } from "./navigation-menu-root.tsx";
import { NavigationMenuTrigger } from "./navigation-menu-trigger.tsx";
import { NavigationMenuViewport } from "./navigation-menu-viewport.tsx";

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
