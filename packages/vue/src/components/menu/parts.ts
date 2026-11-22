import { MenuCheckboxItem } from "./menu-checkbox-item.ts";
import { MenuCheckboxItemIndicator } from "./menu-checkbox-item-indicator.ts";
import { MenuGroup } from "./menu-group.ts";
import { MenuGroupLabel } from "./menu-group-label.ts";
import { createMenuHandle } from "./menu-handle.ts";
import { MenuItem } from "./menu-item.ts";
import { MenuPopup } from "./menu-popup.ts";
import { MenuPortal } from "./menu-portal.ts";
import { MenuPositioner } from "./menu-positioner.ts";
import { MenuRadioGroup } from "./menu-radio-group.ts";
import { MenuRadioItem } from "./menu-radio-item.ts";
import { MenuRadioItemIndicator } from "./menu-radio-item-indicator.ts";
import { MenuRoot, MenuSubmenuRoot } from "./menu-root.ts";
import { MenuSeparator } from "./menu-separator.ts";
import { MenuSubmenuTrigger } from "./menu-submenu-trigger.ts";
import { MenuTrigger } from "./menu-trigger.ts";

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
