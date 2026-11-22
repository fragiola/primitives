import { SelectGroup } from "./select-group.ts";
import { SelectGroupLabel } from "./select-group-label.ts";
import { SelectItem } from "./select-item.ts";
import { SelectItemIndicator } from "./select-item-indicator.ts";
import { SelectItemText } from "./select-item-text.ts";
import { SelectList } from "./select-list.ts";
import { SelectPopup } from "./select-popup.ts";
import { SelectPortal } from "./select-portal.ts";
import { SelectPositioner } from "./select-positioner.ts";
import { SelectRoot } from "./select-root.ts";
import { SelectSeparator } from "./select-separator.ts";
import { SelectTrigger } from "./select-trigger.ts";
import { SelectValue } from "./select-value.ts";

/** spec/select.md */
export const Select = {
    Root: SelectRoot,
    Trigger: SelectTrigger,
    Value: SelectValue,
    Portal: SelectPortal,
    Positioner: SelectPositioner,
    Popup: SelectPopup,
    List: SelectList,
    Item: SelectItem,
    ItemText: SelectItemText,
    ItemIndicator: SelectItemIndicator,
    Group: SelectGroup,
    GroupLabel: SelectGroupLabel,
    Separator: SelectSeparator,
};
