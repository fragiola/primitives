import type { Component } from "vue";
import CheckboxBasic from "../scenarios/checkbox/checkbox-basic.vue";
import CheckboxControlled from "../scenarios/checkbox/checkbox-controlled.vue";
import CheckboxGroupScenario from "../scenarios/checkbox/checkbox-group.vue";
import ComboboxBasic from "../scenarios/combobox/combobox-basic.vue";
import ComboboxControlled from "../scenarios/combobox/combobox-controlled.vue";
import ComboboxField from "../scenarios/combobox/combobox-field.vue";
import ComboboxFiltered from "../scenarios/combobox/combobox-filtered.vue";
import ComboboxForm from "../scenarios/combobox/combobox-form.vue";
import ComboboxGroups from "../scenarios/combobox/combobox-groups.vue";
import ComboboxMultiple from "../scenarios/combobox/combobox-multiple.vue";
import ComboboxObjects from "../scenarios/combobox/combobox-objects.vue";
import ComboboxRejectedInput from "../scenarios/combobox/combobox-rejected-input.vue";
import DialogBasic from "../scenarios/dialog/dialog-basic.vue";
import DialogControlled from "../scenarios/dialog/dialog-controlled.vue";
import DialogInitialFocus from "../scenarios/dialog/dialog-initial-focus.vue";
import DialogNestedPopover from "../scenarios/dialog/dialog-nested-popover.vue";
import DialogRejectedClose from "../scenarios/dialog/dialog-rejected-close.vue";
import FieldBasic from "../scenarios/field/field-basic.vue";
import FieldControls from "../scenarios/field/field-controls.vue";
import FieldValidation from "../scenarios/field/field-validation.vue";
import MenuBasic from "../scenarios/menu/menu-basic.vue";
import MenuGroups from "../scenarios/menu/menu-groups.vue";
import MenuModal from "../scenarios/menu/menu-modal.vue";
import MenuSubmenu from "../scenarios/menu/menu-submenu.vue";
import PopoverArrow from "../scenarios/popover/popover-arrow.vue";
import PopoverBasic from "../scenarios/popover/popover-basic.vue";
import PopoverInitialFocus from "../scenarios/popover/popover-initial-focus.vue";
import PopoverPlacement from "../scenarios/popover/popover-placement.vue";
import PopoverRtl from "../scenarios/popover/popover-rtl.vue";
import SelectBasic from "../scenarios/select/select-basic.vue";
import SelectControlled from "../scenarios/select/select-controlled.vue";
import SelectModal from "../scenarios/select/select-modal.vue";
import SliderBasic from "../scenarios/slider/slider-basic.vue";
import SliderControlled from "../scenarios/slider/slider-controlled.vue";
import SliderRange from "../scenarios/slider/slider-range.vue";
import SliderVertical from "../scenarios/slider/slider-vertical.vue";
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
    "/combobox/basic": ComboboxBasic,
    "/combobox/controlled": ComboboxControlled,
    "/combobox/rejected-input": ComboboxRejectedInput,
    "/combobox/filtered": ComboboxFiltered,
    "/combobox/objects": ComboboxObjects,
    "/combobox/multiple": ComboboxMultiple,
    "/combobox/groups": ComboboxGroups,
    "/combobox/form": ComboboxForm,
    "/combobox/field": ComboboxField,
    "/select/basic": SelectBasic,
    "/select/controlled": SelectControlled,
    "/select/modal": SelectModal,
    "/checkbox/basic": CheckboxBasic,
    "/checkbox/group": CheckboxGroupScenario,
    "/checkbox/controlled": CheckboxControlled,
    "/slider/basic": SliderBasic,
    "/slider/range": SliderRange,
    "/slider/vertical": SliderVertical,
    "/slider/rtl": SliderBasic,
    "/slider/controlled": SliderControlled,
    "/field/basic": FieldBasic,
    "/field/validation": FieldValidation,
    "/field/controls": FieldControls,
};
