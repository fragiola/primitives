import type { ComponentType } from "react";
import { AccordionBasic } from "../scenarios/accordion/accordion-basic.tsx";
import { AccordionHorizontal } from "../scenarios/accordion/accordion-horizontal.tsx";
import { AccordionMultiple } from "../scenarios/accordion/accordion-multiple.tsx";
import { AlertDialogBasic } from "../scenarios/alert-dialog/alert-dialog-basic.tsx";
import { AlertDialogDetached } from "../scenarios/alert-dialog/alert-dialog-detached.tsx";
import { AlertDialogLifecycle } from "../scenarios/alert-dialog/alert-dialog-lifecycle.tsx";
import { AspectRatioBasic } from "../scenarios/aspect-ratio/aspect-ratio-basic.tsx";
import { AutocompleteAsync } from "../scenarios/autocomplete/autocomplete-async.tsx";
import { AutocompleteBasic } from "../scenarios/autocomplete/autocomplete-basic.tsx";
import { AutocompleteBoth } from "../scenarios/autocomplete/autocomplete-both.tsx";
import { AutocompleteField } from "../scenarios/autocomplete/autocomplete-field.tsx";
import { AutocompleteGroups } from "../scenarios/autocomplete/autocomplete-groups.tsx";
import { AutocompleteInline } from "../scenarios/autocomplete/autocomplete-inline.tsx";
import { AutocompleteLifecycle } from "../scenarios/autocomplete/autocomplete-lifecycle.tsx";
import { AutocompleteNone } from "../scenarios/autocomplete/autocomplete-none.tsx";
import { AvatarBasic } from "../scenarios/avatar/avatar-basic.tsx";
import { BreadcrumbsBasic } from "../scenarios/breadcrumbs/breadcrumbs-basic.tsx";
import { BreadcrumbsCollapsed } from "../scenarios/breadcrumbs/breadcrumbs-collapsed.tsx";
import { ButtonBasic } from "../scenarios/button/button-basic.tsx";
import { CalendarMinMax } from "../scenarios/calendar/calendar-min-max.tsx";
import { CalendarRange } from "../scenarios/calendar/calendar-range.tsx";
import { CalendarSingle } from "../scenarios/calendar/calendar-single.tsx";
import { CalendarTwoMonths } from "../scenarios/calendar/calendar-two-months.tsx";
import { CalendarUnavailable } from "../scenarios/calendar/calendar-unavailable.tsx";
import { CalendarPresetBasic } from "../scenarios/calendar-preset/calendar-preset-basic.tsx";
import { CalendarPresetPicker } from "../scenarios/calendar-preset/calendar-preset-picker.tsx";
import { CalendarSystemsBasic } from "../scenarios/calendar-systems/calendar-systems-basic.tsx";
import { CalendarSystemsPickers } from "../scenarios/calendar-systems/calendar-systems-pickers.tsx";
import { CalendarViewPicker } from "../scenarios/calendar-view/calendar-view-picker.tsx";
import { CalendarViewTyped } from "../scenarios/calendar-view/calendar-view-typed.tsx";
import { CarouselAutoplay } from "../scenarios/carousel/carousel-autoplay.tsx";
import { CarouselBasic } from "../scenarios/carousel/carousel-basic.tsx";
import { CarouselMultiple } from "../scenarios/carousel/carousel-multiple.tsx";
import { CarouselTabbed } from "../scenarios/carousel/carousel-tabbed.tsx";
import { CarouselVertical } from "../scenarios/carousel/carousel-vertical.tsx";
import { CheckboxBasic } from "../scenarios/checkbox/checkbox-basic.tsx";
import { CheckboxControlled } from "../scenarios/checkbox/checkbox-controlled.tsx";
import { CheckboxControlledForm } from "../scenarios/checkbox/checkbox-controlled-form.tsx";
import { CheckboxGroupScenario } from "../scenarios/checkbox/checkbox-group.tsx";
import { ClipboardBasic } from "../scenarios/clipboard/clipboard-basic.tsx";
import { ClipboardFailure } from "../scenarios/clipboard/clipboard-failure.tsx";
import { CollapsibleBasic } from "../scenarios/collapsible/collapsible-basic.tsx";
import { CollapsibleHiddenUntilFound } from "../scenarios/collapsible/collapsible-hidden-until-found.tsx";
import { ColorAreaBasic } from "../scenarios/color-area/color-area-basic.tsx";
import { ColorAreaRgb } from "../scenarios/color-area/color-area-rgb.tsx";
import { ColorFieldBasic } from "../scenarios/color-field/color-field-basic.tsx";
import { ColorFieldChannel } from "../scenarios/color-field/color-field-channel.tsx";
import { ColorFieldField } from "../scenarios/color-field/color-field-field.tsx";
import { ColorPickerBasic } from "../scenarios/color-picker/color-picker-basic.tsx";
import { ColorPickerDisabled } from "../scenarios/color-picker/color-picker-disabled.tsx";
import { ColorPickerField } from "../scenarios/color-picker/color-picker-field.tsx";
import { ColorPickerPopoverScenario } from "../scenarios/color-picker/color-picker-popover.tsx";
import { ColorSliderAlpha } from "../scenarios/color-slider/color-slider-alpha.tsx";
import { ColorSliderBasic } from "../scenarios/color-slider/color-slider-basic.tsx";
import { ColorSliderSpace } from "../scenarios/color-slider/color-slider-space.tsx";
import { ColorSliderVertical } from "../scenarios/color-slider/color-slider-vertical.tsx";
import { ColorSwatchBasic } from "../scenarios/color-swatch/color-swatch-basic.tsx";
import { ColorSwatchPickerBasic } from "../scenarios/color-swatch-picker/color-swatch-picker-basic.tsx";
import { ColorSwatchPickerField } from "../scenarios/color-swatch-picker/color-swatch-picker-field.tsx";
import { ColorWheelBasic } from "../scenarios/color-wheel/color-wheel-basic.tsx";
import { ColorWheelDisabled } from "../scenarios/color-wheel/color-wheel-disabled.tsx";
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
import { CommandAsync } from "../scenarios/command/command-async.tsx";
import { CommandBasic } from "../scenarios/command/command-basic.tsx";
import { CommandDialog } from "../scenarios/command/command-dialog.tsx";
import { CommandFilter } from "../scenarios/command/command-filter.tsx";
import { CommandPages } from "../scenarios/command/command-pages.tsx";
import { CommandVirtualBasic } from "../scenarios/command/command-virtual-basic.tsx";
import { ContextMenuBasic } from "../scenarios/context-menu/context-menu-basic.tsx";
import { ContextMenuLifecycle } from "../scenarios/context-menu/context-menu-lifecycle.tsx";
import { DateFieldBasic } from "../scenarios/date-field/date-field-basic.tsx";
import { DateFieldDateTime } from "../scenarios/date-field/date-field-date-time.tsx";
import { DateFieldForm } from "../scenarios/date-field/date-field-form.tsx";
import { DateFieldMinMax } from "../scenarios/date-field/date-field-min-max.tsx";
import { DatePickerBasic } from "../scenarios/date-picker/date-picker-basic.tsx";
import { DatePickerForm } from "../scenarios/date-picker/date-picker-form.tsx";
import { DatePickerLifecycle } from "../scenarios/date-picker/date-picker-lifecycle.tsx";
import { DatePickerMixedForm } from "../scenarios/date-picker/date-picker-mixed-form.tsx";
import { DatePickerRange } from "../scenarios/date-picker/date-picker-range.tsx";
import { DatePickerInputBasic } from "../scenarios/date-picker-input/date-picker-input-basic.tsx";
import { DatePickerInputDateTime } from "../scenarios/date-picker-input/date-picker-input-date-time.tsx";
import { DatePickerInputRange } from "../scenarios/date-picker-input/date-picker-input-range.tsx";
import { DateRangeFieldBasic } from "../scenarios/date-range-field/date-range-field-basic.tsx";
import { DateRangeFieldForm } from "../scenarios/date-range-field/date-range-field-form.tsx";
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
import { EditableBasic } from "../scenarios/editable/editable-basic.tsx";
import { EditableField } from "../scenarios/editable/editable-field.tsx";
import { EditableModes } from "../scenarios/editable/editable-modes.tsx";
import { EditableStates } from "../scenarios/editable/editable-states.tsx";
import { FieldAsync } from "../scenarios/field/field-async.tsx";
import { FieldAsyncBlur } from "../scenarios/field/field-async-blur.tsx";
import { FieldBasic } from "../scenarios/field/field-basic.tsx";
import { FieldControls } from "../scenarios/field/field-controls.tsx";
import { FieldMatch } from "../scenarios/field/field-match.tsx";
import { FieldMoreControls } from "../scenarios/field/field-more-controls.tsx";
import { FieldSettings } from "../scenarios/field/field-settings.tsx";
import { FieldValidation } from "../scenarios/field/field-validation.tsx";
import { FieldsetBasic } from "../scenarios/fieldset/fieldset-basic.tsx";
import { FormBasic } from "../scenarios/form/form-basic.tsx";
import { HoverCardBasic } from "../scenarios/hover-card/hover-card-basic.tsx";
import { HoverCardDetached } from "../scenarios/hover-card/hover-card-detached.tsx";
import { HoverCardInDialog } from "../scenarios/hover-card/hover-card-in-dialog.tsx";
import { HoverCardLifecycle } from "../scenarios/hover-card/hover-card-lifecycle.tsx";
import { LabelControls } from "../scenarios/label/label-controls.tsx";
import { LinkBasic } from "../scenarios/link/link-basic.tsx";
import { LinkRouter } from "../scenarios/link/link-router.tsx";
import { ListboxField } from "../scenarios/listbox/listbox-field.tsx";
import { ListboxGroups } from "../scenarios/listbox/listbox-groups.tsx";
import { ListboxHorizontal } from "../scenarios/listbox/listbox-horizontal.tsx";
import { ListboxMultiple } from "../scenarios/listbox/listbox-multiple.tsx";
import { ListboxReplace } from "../scenarios/listbox/listbox-replace.tsx";
import { ListboxSingle } from "../scenarios/listbox/listbox-single.tsx";
import { MenuBasic } from "../scenarios/menu/menu-basic.tsx";
import { MenuCheckboxRadio } from "../scenarios/menu/menu-checkbox-radio.tsx";
import { MenuControlled } from "../scenarios/menu/menu-controlled.tsx";
import { MenuDetached } from "../scenarios/menu/menu-detached.tsx";
import { MenuGroups } from "../scenarios/menu/menu-groups.tsx";
import { MenuLifecycle } from "../scenarios/menu/menu-lifecycle.tsx";
import { MenuModal } from "../scenarios/menu/menu-modal.tsx";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.tsx";
import { MenubarBasic } from "../scenarios/menubar/menubar-basic.tsx";
import { MenubarModal } from "../scenarios/menubar/menubar-modal.tsx";
import { MenubarVertical } from "../scenarios/menubar/menubar-vertical.tsx";
import { MeterBasic } from "../scenarios/meter/meter-basic.tsx";
import { MonthCalendarBasic } from "../scenarios/month-calendar/month-calendar-basic.tsx";
import { MonthCalendarRange } from "../scenarios/month-calendar/month-calendar-range.tsx";
import { MonthPickerForm } from "../scenarios/month-picker/month-picker-form.tsx";
import { MultipleCalendarBasic } from "../scenarios/multiple-calendar/multiple-calendar-basic.tsx";
import { MultipleCalendarForm } from "../scenarios/multiple-calendar/multiple-calendar-form.tsx";
import { NavigationMenuBasic } from "../scenarios/navigation-menu/navigation-menu-basic.tsx";
import { NavigationMenuNested } from "../scenarios/navigation-menu/navigation-menu-nested.tsx";
import { NumberFieldBasic } from "../scenarios/number-field/number-field-basic.tsx";
import { NumberFieldField } from "../scenarios/number-field/number-field-field.tsx";
import { NumberFieldFormat } from "../scenarios/number-field/number-field-format.tsx";
import { NumberFieldScrub } from "../scenarios/number-field/number-field-scrub.tsx";
import { OtpFieldBasic } from "../scenarios/otp-field/otp-field-basic.tsx";
import { OtpFieldField } from "../scenarios/otp-field/otp-field-field.tsx";
import { PaginationBasic } from "../scenarios/pagination/pagination-basic.tsx";
import { PaginationLinks } from "../scenarios/pagination/pagination-links.tsx";
import { PasswordInputBasic } from "../scenarios/password-input/password-input-basic.tsx";
import { PasswordInputField } from "../scenarios/password-input/password-input-field.tsx";
import { PasswordInputStates } from "../scenarios/password-input/password-input-states.tsx";
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
import { RatingBasic } from "../scenarios/rating/rating-basic.tsx";
import { RatingField } from "../scenarios/rating/rating-field.tsx";
import { RatingHalf } from "../scenarios/rating/rating-half.tsx";
import { RatingReadOnly } from "../scenarios/rating/rating-read-only.tsx";
import { ScrollAreaBasic } from "../scenarios/scroll-area/scroll-area-basic.tsx";
import { ScrollAreaLinks } from "../scenarios/scroll-area/scroll-area-links.tsx";
import { SearchFieldBasic } from "../scenarios/search-field/search-field-basic.tsx";
import { SearchFieldField } from "../scenarios/search-field/search-field-field.tsx";
import { SearchFieldStates } from "../scenarios/search-field/search-field-states.tsx";
import { SegmentedControlBasic } from "../scenarios/segmented-control/segmented-control-basic.tsx";
import { SegmentedControlDisabled } from "../scenarios/segmented-control/segmented-control-disabled.tsx";
import { SegmentedControlField } from "../scenarios/segmented-control/segmented-control-field.tsx";
import { SegmentedControlVertical } from "../scenarios/segmented-control/segmented-control-vertical.tsx";
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
import { SliderThumbName } from "../scenarios/slider/slider-thumb-name.tsx";
import { SliderVertical } from "../scenarios/slider/slider-vertical.tsx";
import { StepsBasic } from "../scenarios/steps/steps-basic.tsx";
import { StepsLinear } from "../scenarios/steps/steps-linear.tsx";
import { SwitchBasic } from "../scenarios/switch/switch-basic.tsx";
import { SwitchControlled } from "../scenarios/switch/switch-controlled.tsx";
import { TabsAnimated } from "../scenarios/tabs/tabs-animated.tsx";
import { TabsAnimatedDefault } from "../scenarios/tabs/tabs-animated-default.tsx";
import { TabsAutomatic } from "../scenarios/tabs/tabs-automatic.tsx";
import { TabsManual } from "../scenarios/tabs/tabs-manual.tsx";
import { TabsNonce } from "../scenarios/tabs/tabs-nonce.tsx";
import { TabsNoneSelected } from "../scenarios/tabs/tabs-none-selected.tsx";
import { TabsVertical } from "../scenarios/tabs/tabs-vertical.tsx";
import { TagGroupBasic } from "../scenarios/tag-group/tag-group-basic.tsx";
import { TagGroupDisabled } from "../scenarios/tag-group/tag-group-disabled.tsx";
import { TagGroupEmpty } from "../scenarios/tag-group/tag-group-empty.tsx";
import { TagGroupField } from "../scenarios/tag-group/tag-group-field.tsx";
import { TagGroupForm } from "../scenarios/tag-group/tag-group-form.tsx";
import { TagGroupSelection } from "../scenarios/tag-group/tag-group-selection.tsx";
import { TagGroupSingle } from "../scenarios/tag-group/tag-group-single.tsx";
import { TagsInputBasic } from "../scenarios/tags-input/tags-input-basic.tsx";
import { TagsInputBlur } from "../scenarios/tags-input/tags-input-blur.tsx";
import { TagsInputEdit } from "../scenarios/tags-input/tags-input-edit.tsx";
import { TagsInputField } from "../scenarios/tags-input/tags-input-field.tsx";
import { TagsInputOptions } from "../scenarios/tags-input/tags-input-options.tsx";
import { TimeFieldBasic } from "../scenarios/time-field/time-field-basic.tsx";
import { TimeFieldForm } from "../scenarios/time-field/time-field-form.tsx";
import { TimeFieldMinMax } from "../scenarios/time-field/time-field-min-max.tsx";
import { TimeRangeFieldBasic } from "../scenarios/time-range-field/time-range-field-basic.tsx";
import { TimeZonesField } from "../scenarios/time-zones/time-zones-field.tsx";
import { TimeZonesPicker } from "../scenarios/time-zones/time-zones-picker.tsx";
import { ToastBasic } from "../scenarios/toast/toast-basic.tsx";
import { ToastLimit } from "../scenarios/toast/toast-limit.tsx";
import { ToastPromise } from "../scenarios/toast/toast-promise.tsx";
import { ToastSwipe } from "../scenarios/toast/toast-swipe.tsx";
import { ToggleBasic } from "../scenarios/toggle/toggle-basic.tsx";
import { ToggleControlled } from "../scenarios/toggle/toggle-controlled.tsx";
import { ToggleGroupBasic } from "../scenarios/toggle-group/toggle-group-basic.tsx";
import { ToggleGroupVertical } from "../scenarios/toggle-group/toggle-group-vertical.tsx";
import { ToolbarBasic } from "../scenarios/toolbar/toolbar-basic.tsx";
import { ToolbarOverlay } from "../scenarios/toolbar/toolbar-overlay.tsx";
import { ToolbarVertical } from "../scenarios/toolbar/toolbar-vertical.tsx";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.tsx";
import { TooltipDetached } from "../scenarios/tooltip/tooltip-detached.tsx";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.tsx";
import { TooltipInDialog } from "../scenarios/tooltip/tooltip-in-dialog.tsx";
import { TooltipLifecycle } from "../scenarios/tooltip/tooltip-lifecycle.tsx";
import { AutocompleteVirtualAsync } from "../scenarios/virtual-lists/autocomplete-virtual-async.tsx";
import { AutocompleteVirtualBasic } from "../scenarios/virtual-lists/autocomplete-virtual-basic.tsx";
import { ComboboxVirtualAsync } from "../scenarios/virtual-lists/combobox-virtual-async.tsx";
import { ComboboxVirtualBasic } from "../scenarios/virtual-lists/combobox-virtual-basic.tsx";
import { ListboxVirtualAsync } from "../scenarios/virtual-lists/listbox-virtual-async.tsx";
/** Every scenario of the specs (spec/<component>.md, "Scenarios"), at `/<component>/<scenario>`. */
import { ListboxVirtualBasic } from "../scenarios/virtual-lists/listbox-virtual-basic.tsx";
import { SelectVirtualAsync } from "../scenarios/virtual-lists/select-virtual-async.tsx";
import { SelectVirtualBasic } from "../scenarios/virtual-lists/select-virtual-basic.tsx";
import { YearCalendarBasic } from "../scenarios/year-calendar/year-calendar-basic.tsx";
import { YearCalendarRange } from "../scenarios/year-calendar/year-calendar-range.tsx";
import { YearPickerForm } from "../scenarios/year-picker/year-picker-form.tsx";
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
    "/color-slider/basic": ColorSliderBasic,
    "/color-slider/alpha": ColorSliderAlpha,
    "/color-slider/vertical": ColorSliderVertical,
    "/color-slider/rtl": ColorSliderBasic,
    "/color-slider/space": ColorSliderSpace,
    "/color-area/basic": ColorAreaBasic,
    "/color-area/rtl": ColorAreaBasic,
    "/color-area/rgb": ColorAreaRgb,
    "/color-wheel/basic": ColorWheelBasic,
    "/color-wheel/disabled": ColorWheelDisabled,
    "/color-field/basic": ColorFieldBasic,
    "/color-field/channel": ColorFieldChannel,
    "/color-field/field": ColorFieldField,
    "/color-swatch/basic": ColorSwatchBasic,
    "/color-swatch-picker/basic": ColorSwatchPickerBasic,
    "/color-swatch-picker/rtl": ColorSwatchPickerBasic,
    "/color-swatch-picker/field": ColorSwatchPickerField,
    "/color-picker/basic": ColorPickerBasic,
    "/color-picker/popover": ColorPickerPopoverScenario,
    "/color-picker/field": ColorPickerField,
    "/color-picker/disabled": ColorPickerDisabled,
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
    "/label/controls": LabelControls,
    "/listbox/single": ListboxSingle,
    "/listbox/multiple": ListboxMultiple,
    "/listbox/replace": ListboxReplace,
    "/listbox/groups": ListboxGroups,
    "/listbox/horizontal": ListboxHorizontal,
    "/listbox/field": ListboxField,
    "/meter/basic": MeterBasic,
    "/multiple-calendar/basic": MultipleCalendarBasic,
    "/multiple-calendar/form": MultipleCalendarForm,
    "/calendar-view/picker": CalendarViewPicker,
    "/calendar-view/typed": CalendarViewTyped,
    "/month-calendar/basic": MonthCalendarBasic,
    "/month-calendar/range": MonthCalendarRange,
    "/year-calendar/basic": YearCalendarBasic,
    "/year-calendar/range": YearCalendarRange,
    "/month-picker/form": MonthPickerForm,
    "/year-picker/form": YearPickerForm,
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
    "/progress/basic": ProgressBasic,
    "/avatar/basic": AvatarBasic,
    "/separator/basic": SeparatorBasic,
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
    "/direction/provider": DirectionProviderScenario,
    "/listbox-virtual/basic": ListboxVirtualBasic,
    "/listbox-virtual/async": ListboxVirtualAsync,
    "/select-virtual/basic": SelectVirtualBasic,
    "/select-virtual/async": SelectVirtualAsync,
    "/combobox-virtual/basic": ComboboxVirtualBasic,
    "/combobox-virtual/async": ComboboxVirtualAsync,
    "/autocomplete-virtual/basic": AutocompleteVirtualBasic,
    "/autocomplete-virtual/async": AutocompleteVirtualAsync,
    "/command/basic": CommandBasic,
    "/command/filter": CommandFilter,
    "/command/pages": CommandPages,
    "/command/async": CommandAsync,
    "/command/dialog": CommandDialog,
    "/command-virtual/basic": CommandVirtualBasic,
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
