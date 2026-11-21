import type { Component } from "vue";
import DialogBasic from "../scenarios/dialog/dialog-basic.vue";
import DialogControlled from "../scenarios/dialog/dialog-controlled.vue";
import DialogInitialFocus from "../scenarios/dialog/dialog-initial-focus.vue";
import DialogNestedPopover from "../scenarios/dialog/dialog-nested-popover.vue";
import DialogRejectedClose from "../scenarios/dialog/dialog-rejected-close.vue";
import MenuBasic from "../scenarios/menu/menu-basic.vue";
import MenuGroups from "../scenarios/menu/menu-groups.vue";
import MenuModal from "../scenarios/menu/menu-modal.vue";
import MenuSubmenu from "../scenarios/menu/menu-submenu.vue";
import PopoverArrow from "../scenarios/popover/popover-arrow.vue";
import PopoverBasic from "../scenarios/popover/popover-basic.vue";
import PopoverInitialFocus from "../scenarios/popover/popover-initial-focus.vue";
import PopoverPlacement from "../scenarios/popover/popover-placement.vue";
import PopoverRtl from "../scenarios/popover/popover-rtl.vue";
import TabsAutomatic from "../scenarios/tabs/tabs-automatic.vue";
import TabsManual from "../scenarios/tabs/tabs-manual.vue";
import TabsVertical from "../scenarios/tabs/tabs-vertical.vue";
import TooltipBasic from "../scenarios/tooltip/tooltip-basic.vue";
import TooltipGroup from "../scenarios/tooltip/tooltip-group.vue";
import TooltipInDialog from "../scenarios/tooltip/tooltip-in-dialog.vue";

/** Every scenario of the specs (spec/<component>.md, "Scenarios"), at `/<component>/<scenario>`. */
export const routes: Record<string, Component> = {
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
