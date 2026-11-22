import type { ComponentType } from "react";
import { CalendarMinMax } from "../scenarios/calendar/calendar-min-max.tsx";
import { CalendarRange } from "../scenarios/calendar/calendar-range.tsx";
import { CalendarSingle } from "../scenarios/calendar/calendar-single.tsx";
import { CalendarTwoMonths } from "../scenarios/calendar/calendar-two-months.tsx";
import { CalendarUnavailable } from "../scenarios/calendar/calendar-unavailable.tsx";
import { CheckboxBasic } from "../scenarios/checkbox/checkbox-basic.tsx";
import { CheckboxControlled } from "../scenarios/checkbox/checkbox-controlled.tsx";
import { CheckboxGroupScenario } from "../scenarios/checkbox/checkbox-group.tsx";
import { ComboboxBasic } from "../scenarios/combobox/combobox-basic.tsx";
import { ComboboxControlled } from "../scenarios/combobox/combobox-controlled.tsx";
import { ComboboxField } from "../scenarios/combobox/combobox-field.tsx";
import { ComboboxFiltered } from "../scenarios/combobox/combobox-filtered.tsx";
import { ComboboxForm } from "../scenarios/combobox/combobox-form.tsx";
import { ComboboxGroups } from "../scenarios/combobox/combobox-groups.tsx";
import { ComboboxMultiple } from "../scenarios/combobox/combobox-multiple.tsx";
import { ComboboxObjects } from "../scenarios/combobox/combobox-objects.tsx";
import { ComboboxRejectedInput } from "../scenarios/combobox/combobox-rejected-input.tsx";
import { DatePickerBasic } from "../scenarios/date-picker/date-picker-basic.tsx";
import { DatePickerRange } from "../scenarios/date-picker/date-picker-range.tsx";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.tsx";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.tsx";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.tsx";
import { DialogNestedPopover } from "../scenarios/dialog/dialog-nested-popover.tsx";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.tsx";
import { FieldBasic } from "../scenarios/field/field-basic.tsx";
import { FieldControls } from "../scenarios/field/field-controls.tsx";
import { FieldValidation } from "../scenarios/field/field-validation.tsx";
import { MenuBasic } from "../scenarios/menu/menu-basic.tsx";
import { MenuGroups } from "../scenarios/menu/menu-groups.tsx";
import { MenuModal } from "../scenarios/menu/menu-modal.tsx";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.tsx";
import { PopoverArrow } from "../scenarios/popover/popover-arrow.tsx";
import { PopoverBasic } from "../scenarios/popover/popover-basic.tsx";
import { PopoverControlled } from "../scenarios/popover/popover-controlled.tsx";
import { PopoverInitialFocus } from "../scenarios/popover/popover-initial-focus.tsx";
import { PopoverPlacement } from "../scenarios/popover/popover-placement.tsx";
import { PopoverRtl } from "../scenarios/popover/popover-rtl.tsx";
import { SelectBasic } from "../scenarios/select/select-basic.tsx";
import { SelectControlled } from "../scenarios/select/select-controlled.tsx";
import { SelectModal } from "../scenarios/select/select-modal.tsx";
import { SliderBasic } from "../scenarios/slider/slider-basic.tsx";
import { SliderControlled } from "../scenarios/slider/slider-controlled.tsx";
import { SliderRange } from "../scenarios/slider/slider-range.tsx";
import { SliderVertical } from "../scenarios/slider/slider-vertical.tsx";
import { TabsAutomatic } from "../scenarios/tabs/tabs-automatic.tsx";
import { TabsManual } from "../scenarios/tabs/tabs-manual.tsx";
import { TabsNoneSelected } from "../scenarios/tabs/tabs-none-selected.tsx";
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
    "/tabs/none-selected": TabsNoneSelected,
    "/popover/basic": PopoverBasic,
    "/popover/initial-focus": PopoverInitialFocus,
    "/popover/placement": PopoverPlacement,
    "/popover/rtl": PopoverRtl,
    "/popover/arrow": PopoverArrow,
    "/popover/controlled": PopoverControlled,
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
    "/calendar/single": CalendarSingle,
    "/calendar/min-max": CalendarMinMax,
    "/calendar/unavailable": CalendarUnavailable,
    "/calendar/locale": CalendarSingle,
    "/calendar/rtl": CalendarSingle,
    "/calendar/two-months": CalendarTwoMonths,
    "/calendar/range": CalendarRange,
    "/date-picker/basic": DatePickerBasic,
    "/date-picker/range": DatePickerRange,
};
