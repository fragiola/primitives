import { MenuCheckboxItem } from "../menu/menu-checkbox-item.tsx";
import { MenuCheckboxItemIndicator } from "../menu/menu-checkbox-item-indicator.tsx";
import { MenuGroup } from "../menu/menu-group.tsx";
import { MenuGroupLabel } from "../menu/menu-group-label.tsx";
import { MenuItem } from "../menu/menu-item.tsx";
import { MenuPopup } from "../menu/menu-popup.tsx";
import { MenuPortal } from "../menu/menu-portal.tsx";
import { MenuPositioner } from "../menu/menu-positioner.tsx";
import { MenuRadioGroup } from "../menu/menu-radio-group.tsx";
import { MenuRadioItem } from "../menu/menu-radio-item.tsx";
import { MenuRadioItemIndicator } from "../menu/menu-radio-item-indicator.tsx";
import { MenuSubmenuRoot } from "../menu/menu-root.tsx";
import { MenuSeparator } from "../menu/menu-separator.tsx";
import { MenuSubmenuTrigger } from "../menu/menu-submenu-trigger.tsx";
import { ContextMenuRoot } from "./context-menu-root.tsx";
import { ContextMenuTrigger } from "./context-menu-trigger.tsx";

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
