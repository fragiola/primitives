import { SelectGroup } from "./select-group.tsx";
import { SelectGroupLabel } from "./select-group-label.tsx";
import { SelectItem } from "./select-item.tsx";
import { SelectItemIndicator } from "./select-item-indicator.tsx";
import { SelectItemText } from "./select-item-text.tsx";
import { SelectList } from "./select-list.tsx";
import { SelectPopup } from "./select-popup.tsx";
import { SelectPortal } from "./select-portal.tsx";
import { SelectPositioner } from "./select-positioner.tsx";
import { SelectRoot } from "./select-root.tsx";
import { SelectSeparator } from "./select-separator.tsx";
import { SelectTrigger } from "./select-trigger.tsx";
import { SelectValue } from "./select-value.tsx";

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
