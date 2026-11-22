import { MenuCheckboxItem } from "../menu/menu-checkbox-item.ts";
import { MenuCheckboxItemIndicator } from "../menu/menu-checkbox-item-indicator.ts";
import { MenuGroup } from "../menu/menu-group.ts";
import { MenuGroupLabel } from "../menu/menu-group-label.ts";
import { MenuItem } from "../menu/menu-item.ts";
import { MenuPopup } from "../menu/menu-popup.ts";
import { MenuPortal } from "../menu/menu-portal.ts";
import { MenuPositioner } from "../menu/menu-positioner.ts";
import { MenuRadioGroup } from "../menu/menu-radio-group.ts";
import { MenuRadioItem } from "../menu/menu-radio-item.ts";
import { MenuRadioItemIndicator } from "../menu/menu-radio-item-indicator.ts";
import { MenuSubmenuRoot } from "../menu/menu-root.ts";
import { MenuSeparator } from "../menu/menu-separator.ts";
import { MenuSubmenuTrigger } from "../menu/menu-submenu-trigger.ts";
import { ContextMenuRoot } from "./context-menu-root.ts";
import { ContextMenuTrigger } from "./context-menu-trigger.ts";

/** spec/context-menu.md: Menu's parts (named `context-menu-*` by the Root), opened from an area */
export const ContextMenu = {
    Root: ContextMenuRoot,
    Trigger: ContextMenuTrigger,
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
};
