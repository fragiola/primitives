import { MenuCheckboxItem } from "./menu-checkbox-item.tsx";
import { MenuCheckboxItemIndicator } from "./menu-checkbox-item-indicator.tsx";
import { MenuGroup } from "./menu-group.tsx";
import { MenuGroupLabel } from "./menu-group-label.tsx";
import { createMenuHandle } from "./menu-handle.ts";
import { MenuItem } from "./menu-item.tsx";
import { MenuPopup } from "./menu-popup.tsx";
import { MenuPortal } from "./menu-portal.tsx";
import { MenuPositioner } from "./menu-positioner.tsx";
import { MenuRadioGroup } from "./menu-radio-group.tsx";
import { MenuRadioItem } from "./menu-radio-item.tsx";
import { MenuRadioItemIndicator } from "./menu-radio-item-indicator.tsx";
import { MenuRoot, MenuSubmenuRoot } from "./menu-root.tsx";
import { MenuSeparator } from "./menu-separator.tsx";
import { MenuSubmenuTrigger } from "./menu-submenu-trigger.tsx";
import { MenuTrigger } from "./menu-trigger.tsx";

/** spec/menu.md */
export const Menu = {
    Root: MenuRoot,
    Trigger: MenuTrigger,
    Portal: MenuPortal,
    Positioner: MenuPositioner,
    Popup: MenuPopup,
    Item: MenuItem,
    Separator: MenuSeparator,
    Group: MenuGroup,
    GroupLabel: MenuGroupLabel,
    CheckboxItem: MenuCheckboxItem,
    CheckboxItemIndicator: MenuCheckboxItemIndicator,
    RadioGroup: MenuRadioGroup,
    RadioItem: MenuRadioItem,
    RadioItemIndicator: MenuRadioItemIndicator,
    SubmenuRoot: MenuSubmenuRoot,
    SubmenuTrigger: MenuSubmenuTrigger,
    createHandle: createMenuHandle,
};
