import type { ComponentType } from "react";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.tsx";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.tsx";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.tsx";
import { DialogNestedPopover } from "../scenarios/dialog/dialog-nested-popover.tsx";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.tsx";
import { MenuBasic } from "../scenarios/menu/menu-basic.tsx";
import { MenuGroups } from "../scenarios/menu/menu-groups.tsx";
import { MenuModal } from "../scenarios/menu/menu-modal.tsx";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.tsx";
import { PopoverArrow } from "../scenarios/popover/popover-arrow.tsx";
import { PopoverBasic } from "../scenarios/popover/popover-basic.tsx";
import { PopoverInitialFocus } from "../scenarios/popover/popover-initial-focus.tsx";
import { PopoverPlacement } from "../scenarios/popover/popover-placement.tsx";
import { PopoverRtl } from "../scenarios/popover/popover-rtl.tsx";
import { TabsAutomatic } from "../scenarios/tabs/tabs-automatic.tsx";
import { TabsManual } from "../scenarios/tabs/tabs-manual.tsx";
import { TabsVertical } from "../scenarios/tabs/tabs-vertical.tsx";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.tsx";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.tsx";
import { TooltipInDialog } from "../scenarios/tooltip/tooltip-in-dialog.tsx";

/** Every scenario of the specs (spec/<component>.md, "Scenarios"), at `/<component>/<scenario>`. */
export const routes: Record<string, ComponentType<{ locale: string }>> = {
    "/dialog/basic": DialogBasic,
    "/dialog/initial-focus": DialogInitialFocus,
    "/dialog/nested-popover": DialogNestedPopover,
    "/dialog/controlled": DialogControlled,
    "/dialog/rejected-close": DialogRejectedClose,
    "/tabs/automatic": TabsAutomatic,
    "/tabs/manual": TabsManual,
    "/tabs/vertical": TabsVertical,
    "/popover/basic": PopoverBasic,
    "/popover/initial-focus": PopoverInitialFocus,
    "/popover/placement": PopoverPlacement,
    "/popover/rtl": PopoverRtl,
    "/popover/arrow": PopoverArrow,
    "/tooltip/basic": TooltipBasic,
    "/tooltip/group": TooltipGroup,
    "/tooltip/in-dialog": TooltipInDialog,
    "/menu/basic": MenuBasic,
    "/menu/submenu": MenuSubmenu,
    "/menu/groups": MenuGroups,
    "/menu/modal": MenuModal,
};
