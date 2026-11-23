import type { Component } from "vue";
import AccordionBasic from "../scenarios/accordion/accordion-basic.vue";
import AccordionHorizontal from "../scenarios/accordion/accordion-horizontal.vue";
import AccordionMultiple from "../scenarios/accordion/accordion-multiple.vue";
import AlertDialogBasic from "../scenarios/alert-dialog/alert-dialog-basic.vue";
import AlertDialogDetached from "../scenarios/alert-dialog/alert-dialog-detached.vue";
import AlertDialogLifecycle from "../scenarios/alert-dialog/alert-dialog-lifecycle.vue";
import AvatarBasic from "../scenarios/avatar/avatar-basic.vue";
import ButtonBasic from "../scenarios/button/button-basic.vue";
import CalendarMinMax from "../scenarios/calendar/calendar-min-max.vue";
import CalendarRange from "../scenarios/calendar/calendar-range.vue";
import CalendarSingle from "../scenarios/calendar/calendar-single.vue";
import CalendarTwoMonths from "../scenarios/calendar/calendar-two-months.vue";
import CalendarUnavailable from "../scenarios/calendar/calendar-unavailable.vue";
import CheckboxBasic from "../scenarios/checkbox/checkbox-basic.vue";
import CheckboxControlled from "../scenarios/checkbox/checkbox-controlled.vue";
import CheckboxControlledForm from "../scenarios/checkbox/checkbox-controlled-form.vue";
import CheckboxGroupScenario from "../scenarios/checkbox/checkbox-group.vue";
import CollapsibleBasic from "../scenarios/collapsible/collapsible-basic.vue";
import CollapsibleHiddenUntilFound from "../scenarios/collapsible/collapsible-hidden-until-found.vue";
import ComboboxBasic from "../scenarios/combobox/combobox-basic.vue";
import ComboboxControlled from "../scenarios/combobox/combobox-controlled.vue";
import ComboboxField from "../scenarios/combobox/combobox-field.vue";
import ComboboxFiltered from "../scenarios/combobox/combobox-filtered.vue";
import ComboboxForm from "../scenarios/combobox/combobox-form.vue";
import ComboboxGroups from "../scenarios/combobox/combobox-groups.vue";
import ComboboxLifecycle from "../scenarios/combobox/combobox-lifecycle.vue";
import ComboboxMultiple from "../scenarios/combobox/combobox-multiple.vue";
import ComboboxObjects from "../scenarios/combobox/combobox-objects.vue";
import ComboboxRejectedInput from "../scenarios/combobox/combobox-rejected-input.vue";
import ContextMenuBasic from "../scenarios/context-menu/context-menu-basic.vue";
import ContextMenuLifecycle from "../scenarios/context-menu/context-menu-lifecycle.vue";
import DatePickerBasic from "../scenarios/date-picker/date-picker-basic.vue";
import DatePickerForm from "../scenarios/date-picker/date-picker-form.vue";
import DatePickerLifecycle from "../scenarios/date-picker/date-picker-lifecycle.vue";
import DatePickerMixedForm from "../scenarios/date-picker/date-picker-mixed-form.vue";
import DatePickerRange from "../scenarios/date-picker/date-picker-range.vue";
import DialogBasic from "../scenarios/dialog/dialog-basic.vue";
import DialogControlled from "../scenarios/dialog/dialog-controlled.vue";
import DialogDetached from "../scenarios/dialog/dialog-detached.vue";
import DialogInitialFocus from "../scenarios/dialog/dialog-initial-focus.vue";
import DialogLifecycle from "../scenarios/dialog/dialog-lifecycle.vue";
import DialogNestedDialogs from "../scenarios/dialog/dialog-nested-dialogs.vue";
import DialogNestedPopover from "../scenarios/dialog/dialog-nested-popover.vue";
import DialogNestedTree from "../scenarios/dialog/dialog-nested-tree.vue";
import DialogRejectedClose from "../scenarios/dialog/dialog-rejected-close.vue";
import DirectionProviderScenario from "../scenarios/direction/direction-provider.vue";
import DrawerBasic from "../scenarios/drawer/drawer-basic.vue";
import DrawerLifecycle from "../scenarios/drawer/drawer-lifecycle.vue";
import DrawerNested from "../scenarios/drawer/drawer-nested.vue";
import DrawerSide from "../scenarios/drawer/drawer-side.vue";
import DrawerSnapPoints from "../scenarios/drawer/drawer-snap-points.vue";
import FieldAsync from "../scenarios/field/field-async.vue";
import FieldAsyncBlur from "../scenarios/field/field-async-blur.vue";
import FieldBasic from "../scenarios/field/field-basic.vue";
import FieldControls from "../scenarios/field/field-controls.vue";
import FieldMatch from "../scenarios/field/field-match.vue";
import FieldMoreControls from "../scenarios/field/field-more-controls.vue";
import FieldSettings from "../scenarios/field/field-settings.vue";
import FieldValidation from "../scenarios/field/field-validation.vue";
import FieldsetBasic from "../scenarios/fieldset/fieldset-basic.vue";
import FormBasic from "../scenarios/form/form-basic.vue";
import MenuBasic from "../scenarios/menu/menu-basic.vue";
import MenuCheckboxRadio from "../scenarios/menu/menu-checkbox-radio.vue";
import MenuControlled from "../scenarios/menu/menu-controlled.vue";
import MenuDetached from "../scenarios/menu/menu-detached.vue";
import MenuGroups from "../scenarios/menu/menu-groups.vue";
import MenuLifecycle from "../scenarios/menu/menu-lifecycle.vue";
import MenuModal from "../scenarios/menu/menu-modal.vue";
import MenuSubmenu from "../scenarios/menu/menu-submenu.vue";
import NavigationMenuBasic from "../scenarios/navigation-menu/navigation-menu-basic.vue";
import NavigationMenuNested from "../scenarios/navigation-menu/navigation-menu-nested.vue";
import PopoverArrow from "../scenarios/popover/popover-arrow.vue";
import PopoverBasic from "../scenarios/popover/popover-basic.vue";
import PopoverControlled from "../scenarios/popover/popover-controlled.vue";
import PopoverDetached from "../scenarios/popover/popover-detached.vue";
import PopoverInitialFocus from "../scenarios/popover/popover-initial-focus.vue";
import PopoverLifecycle from "../scenarios/popover/popover-lifecycle.vue";
import PopoverPlacement from "../scenarios/popover/popover-placement.vue";
import PopoverRtl from "../scenarios/popover/popover-rtl.vue";
import ProgressBasic from "../scenarios/progress/progress-basic.vue";
import RadioGroupBasic from "../scenarios/radio-group/radio-group-basic.vue";
import RadioGroupControlled from "../scenarios/radio-group/radio-group-controlled.vue";
import SelectBasic from "../scenarios/select/select-basic.vue";
import SelectControlled from "../scenarios/select/select-controlled.vue";
import SelectGroups from "../scenarios/select/select-groups.vue";
import SelectLifecycle from "../scenarios/select/select-lifecycle.vue";
import SelectModal from "../scenarios/select/select-modal.vue";
import SeparatorBasic from "../scenarios/separator/separator-basic.vue";
import SliderBasic from "../scenarios/slider/slider-basic.vue";
import SliderControlled from "../scenarios/slider/slider-controlled.vue";
import SliderLabelValue from "../scenarios/slider/slider-label-value.vue";
import SliderRange from "../scenarios/slider/slider-range.vue";
import SliderThumbName from "../scenarios/slider/slider-thumb-name.vue";
import SliderVertical from "../scenarios/slider/slider-vertical.vue";
import SwitchBasic from "../scenarios/switch/switch-basic.vue";
import SwitchControlled from "../scenarios/switch/switch-controlled.vue";
import TabsAnimated from "../scenarios/tabs/tabs-animated.vue";
import TabsAnimatedDefault from "../scenarios/tabs/tabs-animated-default.vue";
import TabsAutomatic from "../scenarios/tabs/tabs-automatic.vue";
import TabsManual from "../scenarios/tabs/tabs-manual.vue";
import TabsNonce from "../scenarios/tabs/tabs-nonce.vue";
import TabsNoneSelected from "../scenarios/tabs/tabs-none-selected.vue";
import TabsVertical from "../scenarios/tabs/tabs-vertical.vue";
import ToggleBasic from "../scenarios/toggle/toggle-basic.vue";
import ToggleControlled from "../scenarios/toggle/toggle-controlled.vue";
import ToggleGroupBasic from "../scenarios/toggle-group/toggle-group-basic.vue";
import ToggleGroupVertical from "../scenarios/toggle-group/toggle-group-vertical.vue";
import ToolbarBasic from "../scenarios/toolbar/toolbar-basic.vue";
import ToolbarVertical from "../scenarios/toolbar/toolbar-vertical.vue";
import TooltipBasic from "../scenarios/tooltip/tooltip-basic.vue";
import TooltipDetached from "../scenarios/tooltip/tooltip-detached.vue";
import TooltipGroup from "../scenarios/tooltip/tooltip-group.vue";
import TooltipInDialog from "../scenarios/tooltip/tooltip-in-dialog.vue";
import TooltipLifecycle from "../scenarios/tooltip/tooltip-lifecycle.vue";

/** Every scenario of the specs (spec/<component>.md, "Scenarios"), at `/<component>/<scenario>`. */
export const routes: Record<string, Component> = {
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
    "/tabs/animated-default": TabsAnimatedDefault,
    "/tabs/nonce": TabsNonce,
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
    "/navigation-menu/basic": NavigationMenuBasic,
    "/navigation-menu/nested": NavigationMenuNested,
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
    "/checkbox/controlled-form": CheckboxControlledForm,
    "/radio-group/basic": RadioGroupBasic,
    "/radio-group/controlled": RadioGroupControlled,
    "/switch/basic": SwitchBasic,
    "/switch/controlled": SwitchControlled,
    "/button/basic": ButtonBasic,
    "/toggle/basic": ToggleBasic,
    "/toggle/controlled": ToggleControlled,
    "/toggle-group/basic": ToggleGroupBasic,
    "/toggle-group/vertical": ToggleGroupVertical,
    "/toolbar/basic": ToolbarBasic,
    "/toolbar/vertical": ToolbarVertical,
    "/slider/basic": SliderBasic,
    "/slider/range": SliderRange,
    "/slider/vertical": SliderVertical,
    "/slider/rtl": SliderBasic,
    "/slider/controlled": SliderControlled,
    "/slider/label-value": SliderLabelValue,
    "/slider/thumb-name": SliderThumbName,
    "/field/basic": FieldBasic,
    "/field/validation": FieldValidation,
    "/field/controls": FieldControls,
    "/field/async": FieldAsync,
    "/field/async-blur": FieldAsyncBlur,
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
    "/date-picker/mixed-form": DatePickerMixedForm,
    "/date-picker/lifecycle": DatePickerLifecycle,
    "/progress/basic": ProgressBasic,
    "/avatar/basic": AvatarBasic,
    "/separator/basic": SeparatorBasic,
    "/direction/provider": DirectionProviderScenario,
};
