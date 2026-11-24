import { CascadeSelectItem } from "./cascade-select-item.ts";
import { CascadeSelectItemIndicator } from "./cascade-select-item-indicator.ts";
import { CascadeSelectLevel } from "./cascade-select-level.ts";
import { CascadeSelectPopup } from "./cascade-select-popup.ts";
import { CascadeSelectPortal } from "./cascade-select-portal.ts";
import { CascadeSelectPositioner } from "./cascade-select-positioner.ts";
import { CascadeSelectRoot } from "./cascade-select-root.ts";
import { CascadeSelectTrigger } from "./cascade-select-trigger.ts";
import { CascadeSelectValue } from "./cascade-select-value.ts";

/** spec/cascade-select.md */
export const CascadeSelect = {
    Root: CascadeSelectRoot,
    Trigger: CascadeSelectTrigger,
    Value: CascadeSelectValue,
    Portal: CascadeSelectPortal,
    Positioner: CascadeSelectPositioner,
    Popup: CascadeSelectPopup,
    Level: CascadeSelectLevel,
    Item: CascadeSelectItem,
    ItemIndicator: CascadeSelectItemIndicator,
};
