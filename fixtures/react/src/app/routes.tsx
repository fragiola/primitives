import type { ComponentType } from "react";
import { AccordionBasic } from "../scenarios/accordion/accordion-basic.tsx";
import { AccordionHorizontal } from "../scenarios/accordion/accordion-horizontal.tsx";
import { AccordionMultiple } from "../scenarios/accordion/accordion-multiple.tsx";
import { AlertDialogBasic } from "../scenarios/alert-dialog/alert-dialog-basic.tsx";
import { AlertDialogDetached } from "../scenarios/alert-dialog/alert-dialog-detached.tsx";
import { AlertDialogLifecycle } from "../scenarios/alert-dialog/alert-dialog-lifecycle.tsx";
import { AvatarBasic } from "../scenarios/avatar/avatar-basic.tsx";
import { ButtonBasic } from "../scenarios/button/button-basic.tsx";
import { CalendarMinMax } from "../scenarios/calendar/calendar-min-max.tsx";
import { CalendarRange } from "../scenarios/calendar/calendar-range.tsx";
import { CalendarSingle } from "../scenarios/calendar/calendar-single.tsx";
import { CalendarTwoMonths } from "../scenarios/calendar/calendar-two-months.tsx";
import { CalendarUnavailable } from "../scenarios/calendar/calendar-unavailable.tsx";
import { CheckboxBasic } from "../scenarios/checkbox/checkbox-basic.tsx";
import { CheckboxControlled } from "../scenarios/checkbox/checkbox-controlled.tsx";
import { CheckboxGroupScenario } from "../scenarios/checkbox/checkbox-group.tsx";
import { CollapsibleBasic } from "../scenarios/collapsible/collapsible-basic.tsx";
import { CollapsibleHiddenUntilFound } from "../scenarios/collapsible/collapsible-hidden-until-found.tsx";
import { ComboboxBasic } from "../scenarios/combobox/combobox-basic.tsx";
import { ComboboxControlled } from "../scenarios/combobox/combobox-controlled.tsx";
import { ComboboxField } from "../scenarios/combobox/combobox-field.tsx";
import { ComboboxFiltered } from "../scenarios/combobox/combobox-filtered.tsx";
import { ComboboxForm } from "../scenarios/combobox/combobox-form.tsx";
import { ComboboxGroups } from "../scenarios/combobox/combobox-groups.tsx";
import { ComboboxLifecycle } from "../scenarios/combobox/combobox-lifecycle.tsx";
import { ComboboxMultiple } from "../scenarios/combobox/combobox-multiple.tsx";
import { ComboboxObjects } from "../scenarios/combobox/combobox-objects.tsx";
import { ComboboxRejectedInput } from "../scenarios/combobox/combobox-rejected-input.tsx";
import { ContextMenuBasic } from "../scenarios/context-menu/context-menu-basic.tsx";
import { ContextMenuLifecycle } from "../scenarios/context-menu/context-menu-lifecycle.tsx";
import { DatePickerBasic } from "../scenarios/date-picker/date-picker-basic.tsx";
import { DatePickerForm } from "../scenarios/date-picker/date-picker-form.tsx";
import { DatePickerLifecycle } from "../scenarios/date-picker/date-picker-lifecycle.tsx";
import { DatePickerRange } from "../scenarios/date-picker/date-picker-range.tsx";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.tsx";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.tsx";
import { DialogDetached } from "../scenarios/dialog/dialog-detached.tsx";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.tsx";
import { DialogLifecycle } from "../scenarios/dialog/dialog-lifecycle.tsx";
import { DialogNestedDialogs } from "../scenarios/dialog/dialog-nested-dialogs.tsx";
import { DialogNestedPopover } from "../scenarios/dialog/dialog-nested-popover.tsx";
import { DialogNestedTree } from "../scenarios/dialog/dialog-nested-tree.tsx";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.tsx";
import { DirectionProviderScenario } from "../scenarios/direction/direction-provider.tsx";
import { DrawerBasic } from "../scenarios/drawer/drawer-basic.tsx";
import { DrawerLifecycle } from "../scenarios/drawer/drawer-lifecycle.tsx";
import { DrawerNested } from "../scenarios/drawer/drawer-nested.tsx";
import { DrawerSide } from "../scenarios/drawer/drawer-side.tsx";
import { DrawerSnapPoints } from "../scenarios/drawer/drawer-snap-points.tsx";
import { FieldAsync } from "../scenarios/field/field-async.tsx";
import { FieldBasic } from "../scenarios/field/field-basic.tsx";
import { FieldControls } from "../scenarios/field/field-controls.tsx";
import { FieldMatch } from "../scenarios/field/field-match.tsx";
import { FieldMoreControls } from "../scenarios/field/field-more-controls.tsx";
import { FieldSettings } from "../scenarios/field/field-settings.tsx";
import { FieldValidation } from "../scenarios/field/field-validation.tsx";
import { FieldsetBasic } from "../scenarios/fieldset/fieldset-basic.tsx";
import { FormBasic } from "../scenarios/form/form-basic.tsx";
import { MenuBasic } from "../scenarios/menu/menu-basic.tsx";
import { MenuCheckboxRadio } from "../scenarios/menu/menu-checkbox-radio.tsx";
import { MenuControlled } from "../scenarios/menu/menu-controlled.tsx";
import { MenuDetached } from "../scenarios/menu/menu-detached.tsx";
import { MenuGroups } from "../scenarios/menu/menu-groups.tsx";
import { MenuLifecycle } from "../scenarios/menu/menu-lifecycle.tsx";
import { MenuModal } from "../scenarios/menu/menu-modal.tsx";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.tsx";
import { PopoverArrow } from "../scenarios/popover/popover-arrow.tsx";
import { PopoverBasic } from "../scenarios/popover/popover-basic.tsx";
import { PopoverControlled } from "../scenarios/popover/popover-controlled.tsx";
import { PopoverDetached } from "../scenarios/popover/popover-detached.tsx";
import { PopoverInitialFocus } from "../scenarios/popover/popover-initial-focus.tsx";
import { PopoverLifecycle } from "../scenarios/popover/popover-lifecycle.tsx";
import { PopoverPlacement } from "../scenarios/popover/popover-placement.tsx";
import { PopoverRtl } from "../scenarios/popover/popover-rtl.tsx";
import { ProgressBasic } from "../scenarios/progress/progress-basic.tsx";
import { RadioGroupBasic } from "../scenarios/radio-group/radio-group-basic.tsx";
import { RadioGroupControlled } from "../scenarios/radio-group/radio-group-controlled.tsx";
import { SelectBasic } from "../scenarios/select/select-basic.tsx";
import { SelectControlled } from "../scenarios/select/select-controlled.tsx";
import { SelectGroups } from "../scenarios/select/select-groups.tsx";
import { SelectLifecycle } from "../scenarios/select/select-lifecycle.tsx";
import { SelectModal } from "../scenarios/select/select-modal.tsx";
import { SeparatorBasic } from "../scenarios/separator/separator-basic.tsx";
import { SliderBasic } from "../scenarios/slider/slider-basic.tsx";
import { SliderControlled } from "../scenarios/slider/slider-controlled.tsx";
import { SliderLabelValue } from "../scenarios/slider/slider-label-value.tsx";
import { SliderRange } from "../scenarios/slider/slider-range.tsx";
import { SliderVertical } from "../scenarios/slider/slider-vertical.tsx";
import { SwitchBasic } from "../scenarios/switch/switch-basic.tsx";
import { SwitchControlled } from "../scenarios/switch/switch-controlled.tsx";
import { TabsAnimated } from "../scenarios/tabs/tabs-animated.tsx";
import { TabsAutomatic } from "../scenarios/tabs/tabs-automatic.tsx";
import { TabsManual } from "../scenarios/tabs/tabs-manual.tsx";
import { TabsNoneSelected } from "../scenarios/tabs/tabs-none-selected.tsx";
import { TabsVertical } from "../scenarios/tabs/tabs-vertical.tsx";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.tsx";
import { TooltipDetached } from "../scenarios/tooltip/tooltip-detached.tsx";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.tsx";
import { TooltipInDialog } from "../scenarios/tooltip/tooltip-in-dialog.tsx";
import { TooltipLifecycle } from "../scenarios/tooltip/tooltip-lifecycle.tsx";

/** Every scenario of the specs (spec/<component>.md, "Scenarios"), at `/<component>/<scenario>`. */
export const routes: Record<
    string,
    ComponentType<{ locale?: string; cancel?: boolean }>
> = {
    "/dialog/basic": DialogBasic,
    "/dialog/initial-focus": DialogInitialFocus,
    "/dialog/nested-popover": DialogNestedPopover,
    "/dialog/controlled": DialogControlled,
    "/dialog/rejected-close": DialogRejectedClose,
    "/dialog/nested-tree": DialogNestedTree,
    "/dialog/nested-dialogs": DialogNestedDialogs,
    "/dialog/detached": DialogDetached,
    "/dialog/lifecycle": DialogLifecycle,
    "/drawer/basic": DrawerBasic,
    "/drawer/side": DrawerSide,
    "/drawer/snap-points": DrawerSnapPoints,
    "/drawer/nested": DrawerNested,
    "/drawer/lifecycle": DrawerLifecycle,
    "/alert-dialog/basic": AlertDialogBasic,
    "/alert-dialog/detached": AlertDialogDetached,
    "/alert-dialog/lifecycle": AlertDialogLifecycle,
    "/tabs/automatic": TabsAutomatic,
    "/tabs/manual": TabsManual,
    "/tabs/vertical": TabsVertical,
    "/tabs/none-selected": TabsNoneSelected,
    "/tabs/animated": TabsAnimated,
    "/collapsible/basic": CollapsibleBasic,
    "/collapsible/hidden-until-found": CollapsibleHiddenUntilFound,
    "/accordion/basic": AccordionBasic,
    "/accordion/multiple": AccordionMultiple,
    "/accordion/horizontal": AccordionHorizontal,
    "/popover/basic": PopoverBasic,
    "/popover/initial-focus": PopoverInitialFocus,
    "/popover/placement": PopoverPlacement,
    "/popover/rtl": PopoverRtl,
    "/popover/arrow": PopoverArrow,
    "/popover/controlled": PopoverControlled,
    "/popover/detached": PopoverDetached,
    "/popover/lifecycle": PopoverLifecycle,
    "/tooltip/basic": TooltipBasic,
    "/tooltip/group": TooltipGroup,
    "/tooltip/in-dialog": TooltipInDialog,
    "/tooltip/detached": TooltipDetached,
    "/tooltip/lifecycle": TooltipLifecycle,
    "/menu/basic": MenuBasic,
    "/menu/submenu": MenuSubmenu,
    "/menu/groups": MenuGroups,
    "/menu/modal": MenuModal,
    "/menu/controlled": MenuControlled,
    "/menu/detached": MenuDetached,
    "/menu/lifecycle": MenuLifecycle,
    "/menu/checkbox-radio": MenuCheckboxRadio,
    "/context-menu/basic": ContextMenuBasic,
    "/context-menu/rtl": ContextMenuBasic,
    "/context-menu/lifecycle": ContextMenuLifecycle,
    "/combobox/basic": ComboboxBasic,
    "/combobox/controlled": ComboboxControlled,
    "/combobox/rejected-input": ComboboxRejectedInput,
    "/combobox/filtered": ComboboxFiltered,
    "/combobox/objects": ComboboxObjects,
    "/combobox/multiple": ComboboxMultiple,
    "/combobox/groups": ComboboxGroups,
    "/combobox/form": ComboboxForm,
    "/combobox/field": ComboboxField,
    "/combobox/lifecycle": ComboboxLifecycle,
    "/select/basic": SelectBasic,
    "/select/controlled": SelectControlled,
    "/select/modal": SelectModal,
    "/select/lifecycle": SelectLifecycle,
    "/select/groups": SelectGroups,
    "/checkbox/basic": CheckboxBasic,
    "/checkbox/group": CheckboxGroupScenario,
    "/checkbox/controlled": CheckboxControlled,
    "/radio-group/basic": RadioGroupBasic,
    "/radio-group/controlled": RadioGroupControlled,
    "/switch/basic": SwitchBasic,
    "/switch/controlled": SwitchControlled,
    "/button/basic": ButtonBasic,
    "/slider/basic": SliderBasic,
    "/slider/range": SliderRange,
    "/slider/vertical": SliderVertical,
    "/slider/rtl": SliderBasic,
    "/slider/controlled": SliderControlled,
    "/slider/label-value": SliderLabelValue,
    "/field/basic": FieldBasic,
    "/field/validation": FieldValidation,
    "/field/controls": FieldControls,
    "/field/async": FieldAsync,
    "/field/match": FieldMatch,
    "/field/more-controls": FieldMoreControls,
    "/field/settings": FieldSettings,
    "/fieldset/basic": FieldsetBasic,
    "/form/basic": FormBasic,
    "/calendar/single": CalendarSingle,
    "/calendar/min-max": CalendarMinMax,
    "/calendar/unavailable": CalendarUnavailable,
    "/calendar/locale": CalendarSingle,
    "/calendar/rtl": CalendarSingle,
    "/calendar/two-months": CalendarTwoMonths,
    "/calendar/range": CalendarRange,
    "/date-picker/basic": DatePickerBasic,
    "/date-picker/range": DatePickerRange,
    "/date-picker/form": DatePickerForm,
    "/date-picker/lifecycle": DatePickerLifecycle,
    "/progress/basic": ProgressBasic,
    "/avatar/basic": AvatarBasic,
    "/separator/basic": SeparatorBasic,
    "/direction/provider": DirectionProviderScenario,
};
