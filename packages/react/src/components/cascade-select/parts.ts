import { CascadeSelectItem } from "./cascade-select-item.tsx";
import { CascadeSelectItemIndicator } from "./cascade-select-item-indicator.tsx";
import { CascadeSelectLevel } from "./cascade-select-level.tsx";
import { CascadeSelectPopup } from "./cascade-select-popup.tsx";
import { CascadeSelectPortal } from "./cascade-select-portal.tsx";
import { CascadeSelectPositioner } from "./cascade-select-positioner.tsx";
import { CascadeSelectRoot } from "./cascade-select-root.tsx";
import { CascadeSelectTrigger } from "./cascade-select-trigger.tsx";
import { CascadeSelectValue } from "./cascade-select-value.tsx";

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
