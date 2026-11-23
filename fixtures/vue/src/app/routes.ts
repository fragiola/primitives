import type { Component } from "vue";
import AccordionBasic from "../scenarios/accordion/accordion-basic.vue";
import AccordionHorizontal from "../scenarios/accordion/accordion-horizontal.vue";
import AccordionMultiple from "../scenarios/accordion/accordion-multiple.vue";
import AlertDialogBasic from "../scenarios/alert-dialog/alert-dialog-basic.vue";
import AlertDialogDetached from "../scenarios/alert-dialog/alert-dialog-detached.vue";
import AlertDialogLifecycle from "../scenarios/alert-dialog/alert-dialog-lifecycle.vue";
import AspectRatioBasic from "../scenarios/aspect-ratio/aspect-ratio-basic.vue";
import AutocompleteAsync from "../scenarios/autocomplete/autocomplete-async.vue";
import AutocompleteBasic from "../scenarios/autocomplete/autocomplete-basic.vue";
import AutocompleteBoth from "../scenarios/autocomplete/autocomplete-both.vue";
import AutocompleteField from "../scenarios/autocomplete/autocomplete-field.vue";
import AutocompleteGroups from "../scenarios/autocomplete/autocomplete-groups.vue";
import AutocompleteInline from "../scenarios/autocomplete/autocomplete-inline.vue";
import AutocompleteLifecycle from "../scenarios/autocomplete/autocomplete-lifecycle.vue";
import AutocompleteNone from "../scenarios/autocomplete/autocomplete-none.vue";
import AvatarBasic from "../scenarios/avatar/avatar-basic.vue";
import BreadcrumbsBasic from "../scenarios/breadcrumbs/breadcrumbs-basic.vue";
import BreadcrumbsCollapsed from "../scenarios/breadcrumbs/breadcrumbs-collapsed.vue";
import ButtonBasic from "../scenarios/button/button-basic.vue";
import CalendarMinMax from "../scenarios/calendar/calendar-min-max.vue";
import CalendarRange from "../scenarios/calendar/calendar-range.vue";
import CalendarSingle from "../scenarios/calendar/calendar-single.vue";
import CalendarTwoMonths from "../scenarios/calendar/calendar-two-months.vue";
import CalendarUnavailable from "../scenarios/calendar/calendar-unavailable.vue";
import CalendarPresetBasic from "../scenarios/calendar-preset/calendar-preset-basic.vue";
import CalendarPresetPicker from "../scenarios/calendar-preset/calendar-preset-picker.vue";
import CalendarSystemsBasic from "../scenarios/calendar-systems/calendar-systems-basic.vue";
import CalendarSystemsPickers from "../scenarios/calendar-systems/calendar-systems-pickers.vue";
import CalendarViewPicker from "../scenarios/calendar-view/calendar-view-picker.vue";
import CalendarViewTyped from "../scenarios/calendar-view/calendar-view-typed.vue";
import CarouselAutoplay from "../scenarios/carousel/carousel-autoplay.vue";
import CarouselBasic from "../scenarios/carousel/carousel-basic.vue";
import CarouselMultiple from "../scenarios/carousel/carousel-multiple.vue";
import CarouselTabbed from "../scenarios/carousel/carousel-tabbed.vue";
import CarouselVertical from "../scenarios/carousel/carousel-vertical.vue";
import CheckboxBasic from "../scenarios/checkbox/checkbox-basic.vue";
import CheckboxControlled from "../scenarios/checkbox/checkbox-controlled.vue";
import CheckboxControlledForm from "../scenarios/checkbox/checkbox-controlled-form.vue";
import CheckboxGroupScenario from "../scenarios/checkbox/checkbox-group.vue";
import ClipboardBasic from "../scenarios/clipboard/clipboard-basic.vue";
import ClipboardFailure from "../scenarios/clipboard/clipboard-failure.vue";
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
import DateFieldBasic from "../scenarios/date-field/date-field-basic.vue";
import DateFieldDateTime from "../scenarios/date-field/date-field-date-time.vue";
import DateFieldForm from "../scenarios/date-field/date-field-form.vue";
import DateFieldMinMax from "../scenarios/date-field/date-field-min-max.vue";
import DatePickerBasic from "../scenarios/date-picker/date-picker-basic.vue";
import DatePickerForm from "../scenarios/date-picker/date-picker-form.vue";
import DatePickerLifecycle from "../scenarios/date-picker/date-picker-lifecycle.vue";
import DatePickerMixedForm from "../scenarios/date-picker/date-picker-mixed-form.vue";
import DatePickerRange from "../scenarios/date-picker/date-picker-range.vue";
import DatePickerInputBasic from "../scenarios/date-picker-input/date-picker-input-basic.vue";
import DatePickerInputDateTime from "../scenarios/date-picker-input/date-picker-input-date-time.vue";
import DatePickerInputRange from "../scenarios/date-picker-input/date-picker-input-range.vue";
import DateRangeFieldBasic from "../scenarios/date-range-field/date-range-field-basic.vue";
import DateRangeFieldForm from "../scenarios/date-range-field/date-range-field-form.vue";
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
import EditableBasic from "../scenarios/editable/editable-basic.vue";
import EditableField from "../scenarios/editable/editable-field.vue";
import EditableModes from "../scenarios/editable/editable-modes.vue";
import EditableStates from "../scenarios/editable/editable-states.vue";
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
import HoverCardBasic from "../scenarios/hover-card/hover-card-basic.vue";
import HoverCardDetached from "../scenarios/hover-card/hover-card-detached.vue";
import HoverCardInDialog from "../scenarios/hover-card/hover-card-in-dialog.vue";
import HoverCardLifecycle from "../scenarios/hover-card/hover-card-lifecycle.vue";
import LabelControls from "../scenarios/label/label-controls.vue";
import LinkBasic from "../scenarios/link/link-basic.vue";
import LinkRouter from "../scenarios/link/link-router.vue";
import ListboxField from "../scenarios/listbox/listbox-field.vue";
import ListboxGroups from "../scenarios/listbox/listbox-groups.vue";
import ListboxHorizontal from "../scenarios/listbox/listbox-horizontal.vue";
import ListboxMultiple from "../scenarios/listbox/listbox-multiple.vue";
import ListboxReplace from "../scenarios/listbox/listbox-replace.vue";
import ListboxSingle from "../scenarios/listbox/listbox-single.vue";
import MenuBasic from "../scenarios/menu/menu-basic.vue";
import MenuCheckboxRadio from "../scenarios/menu/menu-checkbox-radio.vue";
import MenuControlled from "../scenarios/menu/menu-controlled.vue";
import MenuDetached from "../scenarios/menu/menu-detached.vue";
import MenuGroups from "../scenarios/menu/menu-groups.vue";
import MenuLifecycle from "../scenarios/menu/menu-lifecycle.vue";
import MenuModal from "../scenarios/menu/menu-modal.vue";
import MenuSubmenu from "../scenarios/menu/menu-submenu.vue";
import MenubarBasic from "../scenarios/menubar/menubar-basic.vue";
import MenubarModal from "../scenarios/menubar/menubar-modal.vue";
import MenubarVertical from "../scenarios/menubar/menubar-vertical.vue";
import MeterBasic from "../scenarios/meter/meter-basic.vue";
import MonthCalendarBasic from "../scenarios/month-calendar/month-calendar-basic.vue";
import MonthCalendarRange from "../scenarios/month-calendar/month-calendar-range.vue";
import MonthPickerForm from "../scenarios/month-picker/month-picker-form.vue";
import MultipleCalendarBasic from "../scenarios/multiple-calendar/multiple-calendar-basic.vue";
import MultipleCalendarForm from "../scenarios/multiple-calendar/multiple-calendar-form.vue";
import NavigationMenuBasic from "../scenarios/navigation-menu/navigation-menu-basic.vue";
import NavigationMenuNested from "../scenarios/navigation-menu/navigation-menu-nested.vue";
import NumberFieldBasic from "../scenarios/number-field/number-field-basic.vue";
import NumberFieldField from "../scenarios/number-field/number-field-field.vue";
import NumberFieldFormat from "../scenarios/number-field/number-field-format.vue";
import NumberFieldScrub from "../scenarios/number-field/number-field-scrub.vue";
import OtpFieldBasic from "../scenarios/otp-field/otp-field-basic.vue";
import OtpFieldField from "../scenarios/otp-field/otp-field-field.vue";
import PaginationBasic from "../scenarios/pagination/pagination-basic.vue";
import PaginationLinks from "../scenarios/pagination/pagination-links.vue";
import PasswordInputBasic from "../scenarios/password-input/password-input-basic.vue";
import PasswordInputField from "../scenarios/password-input/password-input-field.vue";
import PasswordInputStates from "../scenarios/password-input/password-input-states.vue";
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
import RatingBasic from "../scenarios/rating/rating-basic.vue";
import RatingField from "../scenarios/rating/rating-field.vue";
import RatingHalf from "../scenarios/rating/rating-half.vue";
import RatingReadOnly from "../scenarios/rating/rating-read-only.vue";
import ScrollAreaBasic from "../scenarios/scroll-area/scroll-area-basic.vue";
import ScrollAreaLinks from "../scenarios/scroll-area/scroll-area-links.vue";
import SearchFieldBasic from "../scenarios/search-field/search-field-basic.vue";
import SearchFieldField from "../scenarios/search-field/search-field-field.vue";
import SearchFieldStates from "../scenarios/search-field/search-field-states.vue";
import SegmentedControlBasic from "../scenarios/segmented-control/segmented-control-basic.vue";
import SegmentedControlDisabled from "../scenarios/segmented-control/segmented-control-disabled.vue";
import SegmentedControlField from "../scenarios/segmented-control/segmented-control-field.vue";
import SegmentedControlVertical from "../scenarios/segmented-control/segmented-control-vertical.vue";
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
import StepsBasic from "../scenarios/steps/steps-basic.vue";
import StepsLinear from "../scenarios/steps/steps-linear.vue";
import SwitchBasic from "../scenarios/switch/switch-basic.vue";
import SwitchControlled from "../scenarios/switch/switch-controlled.vue";
import TabsAnimated from "../scenarios/tabs/tabs-animated.vue";
import TabsAnimatedDefault from "../scenarios/tabs/tabs-animated-default.vue";
import TabsAutomatic from "../scenarios/tabs/tabs-automatic.vue";
import TabsManual from "../scenarios/tabs/tabs-manual.vue";
import TabsNonce from "../scenarios/tabs/tabs-nonce.vue";
import TabsNoneSelected from "../scenarios/tabs/tabs-none-selected.vue";
import TabsVertical from "../scenarios/tabs/tabs-vertical.vue";
import TagGroupBasic from "../scenarios/tag-group/tag-group-basic.vue";
import TagGroupDisabled from "../scenarios/tag-group/tag-group-disabled.vue";
import TagGroupEmpty from "../scenarios/tag-group/tag-group-empty.vue";
import TagGroupField from "../scenarios/tag-group/tag-group-field.vue";
import TagGroupForm from "../scenarios/tag-group/tag-group-form.vue";
import TagGroupSelection from "../scenarios/tag-group/tag-group-selection.vue";
import TagGroupSingle from "../scenarios/tag-group/tag-group-single.vue";
import TagsInputBasic from "../scenarios/tags-input/tags-input-basic.vue";
import TagsInputBlur from "../scenarios/tags-input/tags-input-blur.vue";
import TagsInputEdit from "../scenarios/tags-input/tags-input-edit.vue";
import TagsInputField from "../scenarios/tags-input/tags-input-field.vue";
import TagsInputOptions from "../scenarios/tags-input/tags-input-options.vue";
import TimeFieldBasic from "../scenarios/time-field/time-field-basic.vue";
import TimeFieldForm from "../scenarios/time-field/time-field-form.vue";
import TimeFieldMinMax from "../scenarios/time-field/time-field-min-max.vue";
import TimeRangeFieldBasic from "../scenarios/time-range-field/time-range-field-basic.vue";
import TimeZonesField from "../scenarios/time-zones/time-zones-field.vue";
import TimeZonesPicker from "../scenarios/time-zones/time-zones-picker.vue";
import ToastBasic from "../scenarios/toast/toast-basic.vue";
import ToastLimit from "../scenarios/toast/toast-limit.vue";
import ToastPromise from "../scenarios/toast/toast-promise.vue";
import ToastSwipe from "../scenarios/toast/toast-swipe.vue";
import ToggleBasic from "../scenarios/toggle/toggle-basic.vue";
import ToggleControlled from "../scenarios/toggle/toggle-controlled.vue";
import ToggleGroupBasic from "../scenarios/toggle-group/toggle-group-basic.vue";
import ToggleGroupVertical from "../scenarios/toggle-group/toggle-group-vertical.vue";
import ToolbarBasic from "../scenarios/toolbar/toolbar-basic.vue";
import ToolbarOverlay from "../scenarios/toolbar/toolbar-overlay.vue";
import ToolbarVertical from "../scenarios/toolbar/toolbar-vertical.vue";
import TooltipBasic from "../scenarios/tooltip/tooltip-basic.vue";
import TooltipDetached from "../scenarios/tooltip/tooltip-detached.vue";
import TooltipGroup from "../scenarios/tooltip/tooltip-group.vue";
import TooltipInDialog from "../scenarios/tooltip/tooltip-in-dialog.vue";
import TooltipLifecycle from "../scenarios/tooltip/tooltip-lifecycle.vue";
import AutocompleteVirtualAsync from "../scenarios/virtual-lists/autocomplete-virtual-async.vue";
import AutocompleteVirtualBasic from "../scenarios/virtual-lists/autocomplete-virtual-basic.vue";
import ComboboxVirtualAsync from "../scenarios/virtual-lists/combobox-virtual-async.vue";
import ComboboxVirtualBasic from "../scenarios/virtual-lists/combobox-virtual-basic.vue";
import ListboxVirtualAsync from "../scenarios/virtual-lists/listbox-virtual-async.vue";
import ListboxVirtualBasic from "../scenarios/virtual-lists/listbox-virtual-basic.vue";
import SelectVirtualAsync from "../scenarios/virtual-lists/select-virtual-async.vue";
import SelectVirtualBasic from "../scenarios/virtual-lists/select-virtual-basic.vue";
import YearCalendarBasic from "../scenarios/year-calendar/year-calendar-basic.vue";
import YearCalendarRange from "../scenarios/year-calendar/year-calendar-range.vue";
import YearPickerForm from "../scenarios/year-picker/year-picker-form.vue";

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
    "/autocomplete/basic": AutocompleteBasic,
    "/autocomplete/both": AutocompleteBoth,
    "/autocomplete/inline": AutocompleteInline,
    "/autocomplete/none": AutocompleteNone,
    "/autocomplete/groups": AutocompleteGroups,
    "/autocomplete/async": AutocompleteAsync,
    "/autocomplete/field": AutocompleteField,
    "/autocomplete/lifecycle": AutocompleteLifecycle,
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
    "/toolbar/overlay": ToolbarOverlay,
    "/toolbar/vertical": ToolbarVertical,
    "/menubar/basic": MenubarBasic,
    "/menubar/vertical": MenubarVertical,
    "/menubar/modal": MenubarModal,
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
    "/calendar-preset/basic": CalendarPresetBasic,
    "/calendar-preset/picker": CalendarPresetPicker,
    "/date-picker/basic": DatePickerBasic,
    "/date-picker/range": DatePickerRange,
    "/date-picker/form": DatePickerForm,
    "/date-picker/mixed-form": DatePickerMixedForm,
    "/date-picker/lifecycle": DatePickerLifecycle,
    "/progress/basic": ProgressBasic,
    "/avatar/basic": AvatarBasic,
    "/separator/basic": SeparatorBasic,
    "/direction/provider": DirectionProviderScenario,
    "/label/controls": LabelControls,
    "/listbox/single": ListboxSingle,
    "/listbox/multiple": ListboxMultiple,
    "/listbox/replace": ListboxReplace,
    "/listbox/groups": ListboxGroups,
    "/listbox/horizontal": ListboxHorizontal,
    "/listbox/field": ListboxField,
    "/meter/basic": MeterBasic,
    "/calendar-view/picker": CalendarViewPicker,
    "/calendar-view/typed": CalendarViewTyped,
    "/month-calendar/basic": MonthCalendarBasic,
    "/month-calendar/range": MonthCalendarRange,
    "/year-calendar/basic": YearCalendarBasic,
    "/year-calendar/range": YearCalendarRange,
    "/month-picker/form": MonthPickerForm,
    "/year-picker/form": YearPickerForm,
    "/multiple-calendar/basic": MultipleCalendarBasic,
    "/multiple-calendar/form": MultipleCalendarForm,
    "/number-field/basic": NumberFieldBasic,
    "/number-field/field": NumberFieldField,
    "/number-field/format": NumberFieldFormat,
    "/number-field/scrub": NumberFieldScrub,
    "/date-field/basic": DateFieldBasic,
    "/date-field/min-max": DateFieldMinMax,
    "/date-field/form": DateFieldForm,
    "/date-field/date-time": DateFieldDateTime,
    "/time-field/basic": TimeFieldBasic,
    "/time-field/min-max": TimeFieldMinMax,
    "/time-field/form": TimeFieldForm,
    "/date-range-field/basic": DateRangeFieldBasic,
    "/date-range-field/form": DateRangeFieldForm,
    "/time-range-field/basic": TimeRangeFieldBasic,
    "/date-picker-input/basic": DatePickerInputBasic,
    "/date-picker-input/range": DatePickerInputRange,
    "/date-picker-input/date-time": DatePickerInputDateTime,
    "/otp-field/basic": OtpFieldBasic,
    "/otp-field/field": OtpFieldField,
    "/listbox-virtual/basic": ListboxVirtualBasic,
    "/listbox-virtual/async": ListboxVirtualAsync,
    "/select-virtual/basic": SelectVirtualBasic,
    "/select-virtual/async": SelectVirtualAsync,
    "/combobox-virtual/basic": ComboboxVirtualBasic,
    "/combobox-virtual/async": ComboboxVirtualAsync,
    "/autocomplete-virtual/basic": AutocompleteVirtualBasic,
    "/autocomplete-virtual/async": AutocompleteVirtualAsync,
    "/toast/basic": ToastBasic,
    "/toast/limit": ToastLimit,
    "/toast/promise": ToastPromise,
    "/toast/swipe": ToastSwipe,
    "/hover-card/basic": HoverCardBasic,
    "/hover-card/detached": HoverCardDetached,
    "/hover-card/in-dialog": HoverCardInDialog,
    "/hover-card/lifecycle": HoverCardLifecycle,
    "/scroll-area/basic": ScrollAreaBasic,
    "/scroll-area/links": ScrollAreaLinks,
    "/pagination/basic": PaginationBasic,
    "/pagination/links": PaginationLinks,
    "/aspect-ratio/basic": AspectRatioBasic,
    "/tag-group/basic": TagGroupBasic,
    "/tag-group/selection": TagGroupSelection,
    "/tag-group/single": TagGroupSingle,
    "/tag-group/disabled": TagGroupDisabled,
    "/tag-group/empty": TagGroupEmpty,
    "/tag-group/field": TagGroupField,
    "/tag-group/form": TagGroupForm,
    "/tags-input/basic": TagsInputBasic,
    "/tags-input/options": TagsInputOptions,
    "/tags-input/edit": TagsInputEdit,
    "/tags-input/blur": TagsInputBlur,
    "/tags-input/field": TagsInputField,
    "/segmented-control/basic": SegmentedControlBasic,
    "/segmented-control/vertical": SegmentedControlVertical,
    "/segmented-control/disabled": SegmentedControlDisabled,
    "/segmented-control/field": SegmentedControlField,
    "/rating/basic": RatingBasic,
    "/rating/half": RatingHalf,
    "/rating/read-only": RatingReadOnly,
    "/rating/field": RatingField,
    "/password-input/basic": PasswordInputBasic,
    "/password-input/states": PasswordInputStates,
    "/password-input/field": PasswordInputField,
    "/search-field/basic": SearchFieldBasic,
    "/search-field/states": SearchFieldStates,
    "/search-field/field": SearchFieldField,
    "/clipboard/basic": ClipboardBasic,
    "/clipboard/failure": ClipboardFailure,
    "/editable/basic": EditableBasic,
    "/editable/modes": EditableModes,
    "/editable/states": EditableStates,
    "/editable/field": EditableField,
    "/link/basic": LinkBasic,
    "/link/router": LinkRouter,
    "/breadcrumbs/basic": BreadcrumbsBasic,
    "/breadcrumbs/collapsed": BreadcrumbsCollapsed,
    "/steps/basic": StepsBasic,
    "/steps/linear": StepsLinear,
    "/carousel/basic": CarouselBasic,
    "/carousel/autoplay": CarouselAutoplay,
    "/carousel/tabbed": CarouselTabbed,
    "/carousel/multiple": CarouselMultiple,
    "/carousel/vertical": CarouselVertical,
    "/calendar-systems/basic": CalendarSystemsBasic,
    "/calendar-systems/pickers": CalendarSystemsPickers,
    "/time-zones/field": TimeZonesField,
    "/time-zones/picker": TimeZonesPicker,
};
