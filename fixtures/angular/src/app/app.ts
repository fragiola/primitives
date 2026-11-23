import { DOCUMENT } from "@angular/common";
import { Component, inject, ViewEncapsulation } from "@angular/core";
import type { PlainDate } from "@fragiola/primitives-angular/calendar";
import { DirectionProvider } from "@fragiola/primitives-angular/direction";
import { ToastProvider } from "@fragiola/primitives-angular/toast";
import { readQuery } from "../kit/query.ts";
import { AccordionBasic } from "../scenarios/accordion/accordion-basic.ts";
import { AccordionHorizontal } from "../scenarios/accordion/accordion-horizontal.ts";
import { AccordionMultiple } from "../scenarios/accordion/accordion-multiple.ts";
import { AlertDialogBasic } from "../scenarios/alert-dialog/alert-dialog-basic.ts";
import { AlertDialogDetached } from "../scenarios/alert-dialog/alert-dialog-detached.ts";
import { AlertDialogLifecycle } from "../scenarios/alert-dialog/alert-dialog-lifecycle.ts";
import { AspectRatioBasic } from "../scenarios/aspect-ratio/aspect-ratio-basic.ts";
import { AutocompleteAsync } from "../scenarios/autocomplete/autocomplete-async.ts";
import { AutocompleteBasic } from "../scenarios/autocomplete/autocomplete-basic.ts";
import { AutocompleteBoth } from "../scenarios/autocomplete/autocomplete-both.ts";
import { AutocompleteField } from "../scenarios/autocomplete/autocomplete-field.ts";
import { AutocompleteGroups } from "../scenarios/autocomplete/autocomplete-groups.ts";
import { AutocompleteInline } from "../scenarios/autocomplete/autocomplete-inline.ts";
import { AutocompleteLifecycle } from "../scenarios/autocomplete/autocomplete-lifecycle.ts";
import { AutocompleteNone } from "../scenarios/autocomplete/autocomplete-none.ts";
import { AvatarBasic } from "../scenarios/avatar/avatar-basic.ts";
import { ButtonBasic } from "../scenarios/button/button-basic.ts";
import { CalendarRange } from "../scenarios/calendar/calendar-range.ts";
import { CalendarTwoMonths } from "../scenarios/calendar/calendar-two-months.ts";
import { SingleCalendar } from "../scenarios/calendar/single-calendar.ts";
import { CheckboxBasic } from "../scenarios/checkbox/checkbox-basic.ts";
import { CheckboxControlled } from "../scenarios/checkbox/checkbox-controlled.ts";
import { CheckboxControlledForm } from "../scenarios/checkbox/checkbox-controlled-form.ts";
import { CheckboxGroupScenario } from "../scenarios/checkbox/checkbox-group.ts";
import { CollapsibleBasic } from "../scenarios/collapsible/collapsible-basic.ts";
import { CollapsibleHiddenUntilFound } from "../scenarios/collapsible/collapsible-hidden-until-found.ts";
import { ComboboxBasic } from "../scenarios/combobox/combobox-basic.ts";
import { ComboboxControlled } from "../scenarios/combobox/combobox-controlled.ts";
import { ComboboxField } from "../scenarios/combobox/combobox-field.ts";
import { ComboboxFiltered } from "../scenarios/combobox/combobox-filtered.ts";
import { ComboboxForm } from "../scenarios/combobox/combobox-form.ts";
import { ComboboxGroups } from "../scenarios/combobox/combobox-groups.ts";
import { ComboboxLifecycle } from "../scenarios/combobox/combobox-lifecycle.ts";
import { ComboboxMultiple } from "../scenarios/combobox/combobox-multiple.ts";
import { ComboboxObjects } from "../scenarios/combobox/combobox-objects.ts";
import { ComboboxRejectedInput } from "../scenarios/combobox/combobox-rejected-input.ts";
import { ContextMenuBasic } from "../scenarios/context-menu/context-menu-basic.ts";
import { ContextMenuLifecycle } from "../scenarios/context-menu/context-menu-lifecycle.ts";
import { DateFieldBasic } from "../scenarios/date-field/date-field-basic.ts";
import { DateFieldDateTime } from "../scenarios/date-field/date-field-date-time.ts";
import { DateFieldForm } from "../scenarios/date-field/date-field-form.ts";
import { DateFieldMinMax } from "../scenarios/date-field/date-field-min-max.ts";
import { DatePickerBasic } from "../scenarios/date-picker/date-picker-basic.ts";
import { DatePickerForm } from "../scenarios/date-picker/date-picker-form.ts";
import { DatePickerLifecycle } from "../scenarios/date-picker/date-picker-lifecycle.ts";
import { DatePickerMixedForm } from "../scenarios/date-picker/date-picker-mixed-form.ts";
import { DatePickerRange } from "../scenarios/date-picker/date-picker-range.ts";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.ts";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.ts";
import { DialogDetached } from "../scenarios/dialog/dialog-detached.ts";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.ts";
import { DialogLifecycle } from "../scenarios/dialog/dialog-lifecycle.ts";
import { DialogNestedDialogs } from "../scenarios/dialog/dialog-nested-dialogs.ts";
import { DialogNestedPopover } from "../scenarios/dialog/dialog-nested-popover.ts";
import { DialogNestedTree } from "../scenarios/dialog/dialog-nested-tree.ts";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.ts";
import { DirectionProviderScenario } from "../scenarios/direction/direction-provider.ts";
import { DrawerBasic } from "../scenarios/drawer/drawer-basic.ts";
import { DrawerLifecycle } from "../scenarios/drawer/drawer-lifecycle.ts";
import { DrawerNested } from "../scenarios/drawer/drawer-nested.ts";
import { DrawerSide } from "../scenarios/drawer/drawer-side.ts";
import { DrawerSnapPoints } from "../scenarios/drawer/drawer-snap-points.ts";
import { FieldAsync } from "../scenarios/field/field-async.ts";
import { FieldAsyncBlur } from "../scenarios/field/field-async-blur.ts";
import { FieldBasic } from "../scenarios/field/field-basic.ts";
import { FieldControls } from "../scenarios/field/field-controls.ts";
import { FieldMatch } from "../scenarios/field/field-match.ts";
import { FieldMoreControls } from "../scenarios/field/field-more-controls.ts";
import { FieldSettings } from "../scenarios/field/field-settings.ts";
import { FieldValidation } from "../scenarios/field/field-validation.ts";
import { FieldsetBasic } from "../scenarios/fieldset/fieldset-basic.ts";
import { FormBasic } from "../scenarios/form/form-basic.ts";
import { HoverCardBasic } from "../scenarios/hover-card/hover-card-basic.ts";
import { HoverCardDetached } from "../scenarios/hover-card/hover-card-detached.ts";
import { HoverCardInDialog } from "../scenarios/hover-card/hover-card-in-dialog.ts";
import { HoverCardLifecycle } from "../scenarios/hover-card/hover-card-lifecycle.ts";
import { LabelControls } from "../scenarios/label/label-controls.ts";
import { ListboxField } from "../scenarios/listbox/listbox-field.ts";
import { ListboxGroups } from "../scenarios/listbox/listbox-groups.ts";
import { ListboxHorizontal } from "../scenarios/listbox/listbox-horizontal.ts";
import { ListboxMultiple } from "../scenarios/listbox/listbox-multiple.ts";
import { ListboxReplace } from "../scenarios/listbox/listbox-replace.ts";
import { ListboxSingle } from "../scenarios/listbox/listbox-single.ts";
import { MenuBasic } from "../scenarios/menu/menu-basic.ts";
import { MenuCheckboxRadio } from "../scenarios/menu/menu-checkbox-radio.ts";
import { MenuControlled } from "../scenarios/menu/menu-controlled.ts";
import { MenuDetached } from "../scenarios/menu/menu-detached.ts";
import { MenuGroups } from "../scenarios/menu/menu-groups.ts";
import { MenuLifecycle } from "../scenarios/menu/menu-lifecycle.ts";
import { MenuModal } from "../scenarios/menu/menu-modal.ts";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.ts";
import { MenubarBasic } from "../scenarios/menubar/menubar-basic.ts";
import { MenubarModal } from "../scenarios/menubar/menubar-modal.ts";
import { MenubarVertical } from "../scenarios/menubar/menubar-vertical.ts";
import { MeterBasic } from "../scenarios/meter/meter-basic.ts";
import { NavigationMenuBasic } from "../scenarios/navigation-menu/navigation-menu-basic.ts";
import { NavigationMenuNested } from "../scenarios/navigation-menu/navigation-menu-nested.ts";
import { NumberFieldBasic } from "../scenarios/number-field/number-field-basic.ts";
import { NumberFieldField } from "../scenarios/number-field/number-field-field.ts";
import { NumberFieldFormat } from "../scenarios/number-field/number-field-format.ts";
import { NumberFieldScrub } from "../scenarios/number-field/number-field-scrub.ts";
import { OtpFieldBasic } from "../scenarios/otp-field/otp-field-basic.ts";
import { OtpFieldField } from "../scenarios/otp-field/otp-field-field.ts";
import { PaginationBasic } from "../scenarios/pagination/pagination-basic.ts";
import { PaginationLinks } from "../scenarios/pagination/pagination-links.ts";
import { PopoverArrow } from "../scenarios/popover/popover-arrow.ts";
import { PopoverBasic } from "../scenarios/popover/popover-basic.ts";
import { PopoverControlled } from "../scenarios/popover/popover-controlled.ts";
import { PopoverDetached } from "../scenarios/popover/popover-detached.ts";
import { PopoverInitialFocus } from "../scenarios/popover/popover-initial-focus.ts";
import { PopoverLifecycle } from "../scenarios/popover/popover-lifecycle.ts";
import { PopoverPlacement } from "../scenarios/popover/popover-placement.ts";
import { PopoverRtl } from "../scenarios/popover/popover-rtl.ts";
import { ProgressBasic } from "../scenarios/progress/progress-basic.ts";
import { RadioGroupBasic } from "../scenarios/radio-group/radio-group-basic.ts";
import { RadioGroupControlled } from "../scenarios/radio-group/radio-group-controlled.ts";
import { ScrollAreaBasic } from "../scenarios/scroll-area/scroll-area-basic.ts";
import { ScrollAreaLinks } from "../scenarios/scroll-area/scroll-area-links.ts";
import { SelectBasic } from "../scenarios/select/select-basic.ts";
import { SelectControlled } from "../scenarios/select/select-controlled.ts";
import { SelectGroups } from "../scenarios/select/select-groups.ts";
import { SelectLifecycle } from "../scenarios/select/select-lifecycle.ts";
import { SelectModal } from "../scenarios/select/select-modal.ts";
import { SeparatorBasic } from "../scenarios/separator/separator-basic.ts";
import { SliderBasic } from "../scenarios/slider/slider-basic.ts";
import { SliderControlled } from "../scenarios/slider/slider-controlled.ts";
import { SliderLabelValue } from "../scenarios/slider/slider-label-value.ts";
import { SliderRange } from "../scenarios/slider/slider-range.ts";
import { SliderThumbName } from "../scenarios/slider/slider-thumb-name.ts";
import { SliderVertical } from "../scenarios/slider/slider-vertical.ts";
import { SwitchBasic } from "../scenarios/switch/switch-basic.ts";
import { SwitchControlled } from "../scenarios/switch/switch-controlled.ts";
import { SettingsTabs } from "../scenarios/tabs/settings-tabs.ts";
import { TabsAnimated } from "../scenarios/tabs/tabs-animated.ts";
import { TabsAnimatedDefault } from "../scenarios/tabs/tabs-animated-default.ts";
import { TabsNoneSelected } from "../scenarios/tabs/tabs-none-selected.ts";
import { TimeFieldBasic } from "../scenarios/time-field/time-field-basic.ts";
import { TimeFieldForm } from "../scenarios/time-field/time-field-form.ts";
import { TimeFieldMinMax } from "../scenarios/time-field/time-field-min-max.ts";
import { ToastBasic } from "../scenarios/toast/toast-basic.ts";
import { ToastLimit } from "../scenarios/toast/toast-limit.ts";
import { ToastPromise } from "../scenarios/toast/toast-promise.ts";
import { notifications } from "../scenarios/toast/toast-queue.ts";
import { ToastSwipe } from "../scenarios/toast/toast-swipe.ts";
import { ToggleBasic } from "../scenarios/toggle/toggle-basic.ts";
import { ToggleControlled } from "../scenarios/toggle/toggle-controlled.ts";
import { ToggleGroupBasic } from "../scenarios/toggle-group/toggle-group-basic.ts";
import { ToggleGroupVertical } from "../scenarios/toggle-group/toggle-group-vertical.ts";
import { ToolbarBasic } from "../scenarios/toolbar/toolbar-basic.ts";
import { ToolbarOverlay } from "../scenarios/toolbar/toolbar-overlay.ts";
import { ToolbarVertical } from "../scenarios/toolbar/toolbar-vertical.ts";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.ts";
import { TooltipDetached } from "../scenarios/tooltip/tooltip-detached.ts";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.ts";
import { TooltipInDialog } from "../scenarios/tooltip/tooltip-in-dialog.ts";
import { TooltipLifecycle } from "../scenarios/tooltip/tooltip-lifecycle.ts";
import { AutocompleteVirtualAsync } from "../scenarios/virtual-lists/autocomplete-virtual-async.ts";
import { AutocompleteVirtualBasic } from "../scenarios/virtual-lists/autocomplete-virtual-basic.ts";
import { ComboboxVirtualAsync } from "../scenarios/virtual-lists/combobox-virtual-async.ts";
import { ComboboxVirtualBasic } from "../scenarios/virtual-lists/combobox-virtual-basic.ts";
import { ListboxVirtualAsync } from "../scenarios/virtual-lists/listbox-virtual-async.ts";
import { ListboxVirtualBasic } from "../scenarios/virtual-lists/listbox-virtual-basic.ts";
import { SelectVirtualAsync } from "../scenarios/virtual-lists/select-virtual-async.ts";
import { SelectVirtualBasic } from "../scenarios/virtual-lists/select-virtual-basic.ts";
import { ROUTES } from "./routes.ts";

/**
 * The fixture's root, on `<div id="root">`. Each scenario is a component whose host is the
 * `<main>` (an attribute selector), so the page has React's DOM: `#root > main.p-6 > ...`.
 */
@Component({
    selector: "[fixture-app]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DialogBasic,
        DialogInitialFocus,
        DialogControlled,
        DialogRejectedClose,
        DialogNestedPopover,
        DialogNestedTree,
        DialogNestedDialogs,
        DialogDetached,
        DialogLifecycle,
        DrawerBasic,
        DrawerSide,
        DrawerSnapPoints,
        DrawerNested,
        DrawerLifecycle,
        AlertDialogBasic,
        AlertDialogDetached,
        AlertDialogLifecycle,
        SettingsTabs,
        TabsNoneSelected,
        TabsAnimated,
        TabsAnimatedDefault,
        CollapsibleBasic,
        CollapsibleHiddenUntilFound,
        AccordionBasic,
        AccordionMultiple,
        AccordionHorizontal,
        PopoverBasic,
        PopoverControlled,
        PopoverInitialFocus,
        PopoverPlacement,
        PopoverRtl,
        PopoverArrow,
        PopoverDetached,
        PopoverLifecycle,
        TooltipBasic,
        TooltipGroup,
        TooltipInDialog,
        TooltipDetached,
        TooltipLifecycle,
        MenuBasic,
        MenuControlled,
        MenuSubmenu,
        MenuGroups,
        MenuModal,
        MenuDetached,
        MenuLifecycle,
        NavigationMenuBasic,
        NavigationMenuNested,
        MenuCheckboxRadio,
        ContextMenuBasic,
        ContextMenuLifecycle,
        CheckboxBasic,
        CheckboxControlled,
        CheckboxControlledForm,
        CheckboxGroupScenario,
        ComboboxBasic,
        ComboboxControlled,
        ComboboxField,
        ComboboxFiltered,
        ComboboxForm,
        ComboboxGroups,
        ComboboxMultiple,
        ComboboxObjects,
        ComboboxRejectedInput,
        ComboboxLifecycle,
        AutocompleteAsync,
        AutocompleteBasic,
        AutocompleteBoth,
        AutocompleteField,
        AutocompleteGroups,
        AutocompleteInline,
        AutocompleteLifecycle,
        AutocompleteNone,
        FieldBasic,
        FieldControls,
        FieldValidation,
        SelectBasic,
        SelectControlled,
        SelectModal,
        SelectLifecycle,
        SelectGroups,
        SliderBasic,
        SliderControlled,
        SliderRange,
        SliderVertical,
        SingleCalendar,
        CalendarTwoMonths,
        CalendarRange,
        DatePickerBasic,
        DatePickerRange,
        DatePickerForm,
        DatePickerMixedForm,
        DatePickerLifecycle,
        SliderLabelValue,
        SliderThumbName,
        FieldAsync,
        FieldAsyncBlur,
        FieldMatch,
        FieldMoreControls,
        FieldsetBasic,
        FormBasic,
        DirectionProvider,
        DirectionProviderScenario,
        AvatarBasic,
        ButtonBasic,
        FieldSettings,
        LabelControls,
        ListboxField,
        ListboxGroups,
        ListboxHorizontal,
        ListboxMultiple,
        ListboxReplace,
        ListboxSingle,
        MeterBasic,
        NumberFieldBasic,
        NumberFieldField,
        NumberFieldFormat,
        NumberFieldScrub,
        DateFieldBasic,
        DateFieldMinMax,
        DateFieldForm,
        DateFieldDateTime,
        TimeFieldBasic,
        TimeFieldMinMax,
        TimeFieldForm,
        OtpFieldBasic,
        OtpFieldField,
        ProgressBasic,
        RadioGroupBasic,
        RadioGroupControlled,
        SeparatorBasic,
        ToggleBasic,
        ToggleControlled,
        ToggleGroupBasic,
        ToggleGroupVertical,
        ToolbarBasic,
        ToolbarOverlay,
        ToolbarVertical,
        MenubarBasic,
        MenubarVertical,
        MenubarModal,
        SwitchBasic,
        SwitchControlled,
        ListboxVirtualBasic,
        ListboxVirtualAsync,
        SelectVirtualBasic,
        SelectVirtualAsync,
        ComboboxVirtualBasic,
        ComboboxVirtualAsync,
        AutocompleteVirtualBasic,
        AutocompleteVirtualAsync,
        ToastProvider,
        ToastBasic,
        ToastLimit,
        ToastPromise,
        ToastSwipe,
        HoverCardBasic,
        HoverCardDetached,
        HoverCardInDialog,
        HoverCardLifecycle,
        ScrollAreaBasic,
        ScrollAreaLinks,
        PaginationBasic,
        PaginationLinks,
        AspectRatioBasic,
    ],
    template: `
        @switch (path) {
            @case ("/dialog/basic") { <main class="p-6" scenario-dialog-basic></main> }
            @case ("/dialog/initial-focus") { <main class="p-6" scenario-dialog-initial-focus></main> }
            @case ("/dialog/nested-popover") { <main class="p-6" scenario-dialog-nested-popover></main> }
            @case ("/dialog/controlled") { <main class="p-6" scenario-dialog-controlled></main> }
            @case ("/dialog/rejected-close") { <main class="p-6" scenario-dialog-rejected-close></main> }
            @case ("/dialog/nested-tree") { <main class="p-6" scenario-dialog-nested-tree></main> }
            @case ("/dialog/nested-dialogs") { <main class="p-6" scenario-dialog-nested-dialogs></main> }
            @case ("/dialog/detached") { <main class="p-6" scenario-dialog-detached></main> }
            @case ("/dialog/lifecycle") { <main class="p-6" scenario-dialog-lifecycle [cancel]="query.cancel"></main> }
            @case ("/drawer/basic") { <main class="p-6" scenario-drawer-basic></main> }
            @case ("/drawer/side") { <main class="p-6" scenario-drawer-side></main> }
            @case ("/drawer/snap-points") { <main class="p-6" scenario-drawer-snap-points></main> }
            @case ("/drawer/nested") { <main class="p-6" scenario-drawer-nested></main> }
            @case ("/drawer/lifecycle") { <main class="p-6" scenario-drawer-lifecycle [cancel]="query.cancel"></main> }
            @case ("/alert-dialog/basic") { <main class="p-6" scenario-alert-dialog-basic></main> }
            @case ("/alert-dialog/detached") { <main class="p-6" scenario-alert-dialog-detached></main> }
            @case ("/alert-dialog/lifecycle") { <main class="p-6" scenario-alert-dialog-lifecycle [cancel]="query.cancel"></main> }
            @case ("/tabs/automatic") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="horizontal"></main> }
            @case ("/tabs/manual") { <main class="p-6" scenario-settings-tabs activation="manual" orientation="horizontal"></main> }
            @case ("/tabs/vertical") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="vertical"></main> }
            @case ("/tabs/none-selected") { <main class="p-6" scenario-tabs-none-selected></main> }
            @case ("/tabs/animated") { <main class="p-6" scenario-tabs-animated></main> }
            @case ("/tabs/animated-default") { <main class="p-6" scenario-tabs-animated-default></main> }
            @case ("/tabs/nonce") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="horizontal" nonce="fixture-nonce"></main> }
            @case ("/collapsible/basic") { <main class="p-6" scenario-collapsible-basic></main> }
            @case ("/collapsible/hidden-until-found") { <main class="p-6" scenario-collapsible-hidden-until-found></main> }
            @case ("/accordion/basic") { <main class="p-6" scenario-accordion-basic></main> }
            @case ("/accordion/multiple") { <main class="p-6" scenario-accordion-multiple></main> }
            @case ("/accordion/horizontal") { <main class="p-6" scenario-accordion-horizontal></main> }
            @case ("/popover/basic") { <main class="p-6" scenario-popover-basic></main> }
            @case ("/popover/initial-focus") { <main class="p-6" scenario-popover-initial-focus></main> }
            @case ("/popover/placement") { <main class="p-6" scenario-popover-placement></main> }
            @case ("/popover/rtl") { <main class="p-6" scenario-popover-rtl></main> }
            @case ("/popover/arrow") { <main class="p-6" scenario-popover-arrow></main> }
            @case ("/popover/controlled") { <main class="p-6" scenario-popover-controlled></main> }
            @case ("/popover/detached") { <main class="p-6" scenario-popover-detached></main> }
            @case ("/popover/lifecycle") { <main class="p-6" scenario-popover-lifecycle [cancel]="query.cancel"></main> }
            @case ("/tooltip/basic") { <main class="p-6" scenario-tooltip-basic></main> }
            @case ("/tooltip/group") { <main class="p-6" scenario-tooltip-group></main> }
            @case ("/tooltip/in-dialog") { <main class="p-6" scenario-tooltip-in-dialog></main> }
            @case ("/tooltip/detached") { <main class="p-6" scenario-tooltip-detached></main> }
            @case ("/tooltip/lifecycle") { <main class="p-6" scenario-tooltip-lifecycle [cancel]="query.cancel"></main> }
            @case ("/menu/basic") { <main class="p-6" scenario-menu-basic></main> }
            @case ("/menu/submenu") { <main class="p-6" scenario-menu-submenu></main> }
            @case ("/menu/groups") { <main class="p-6" scenario-menu-groups></main> }
            @case ("/menu/modal") { <main class="p-6" scenario-menu-modal></main> }
            @case ("/menu/controlled") { <main class="p-6" scenario-menu-controlled></main> }
            @case ("/menu/detached") { <main class="p-6" scenario-menu-detached></main> }
            @case ("/menu/lifecycle") { <main class="p-6" scenario-menu-lifecycle [cancel]="query.cancel"></main> }
            @case ("/navigation-menu/basic") { <main class="p-6" scenario-navigation-menu-basic></main> }
            @case ("/navigation-menu/nested") { <main class="p-6" scenario-navigation-menu-nested></main> }
            @case ("/menu/checkbox-radio") { <main class="p-6" scenario-menu-checkbox-radio></main> }
            @case ("/context-menu/basic") { <main class="p-6" scenario-context-menu-basic></main> }
            @case ("/context-menu/rtl") { <main class="p-6" scenario-context-menu-basic></main> }
            @case ("/context-menu/lifecycle") { <main class="p-6" scenario-context-menu-lifecycle [cancel]="query.cancel"></main> }
            @case ("/combobox/basic") { <main class="p-6" scenario-combobox-basic></main> }
            @case ("/combobox/controlled") { <main class="p-6" scenario-combobox-controlled></main> }
            @case ("/combobox/rejected-input") { <main class="p-6" scenario-combobox-rejected-input></main> }
            @case ("/combobox/filtered") { <main class="p-6" scenario-combobox-filtered></main> }
            @case ("/combobox/objects") { <main class="p-6" scenario-combobox-objects></main> }
            @case ("/combobox/multiple") { <main class="p-6" scenario-combobox-multiple></main> }
            @case ("/combobox/groups") { <main class="p-6" scenario-combobox-groups></main> }
            @case ("/combobox/form") { <main class="p-6" scenario-combobox-form></main> }
            @case ("/combobox/field") { <main class="p-6" scenario-combobox-field></main> }
            @case ("/combobox/lifecycle") { <main class="p-6" scenario-combobox-lifecycle [cancel]="query.cancel"></main> }
            @case ("/autocomplete/basic") { <main class="p-6" scenario-autocomplete-basic></main> }
            @case ("/autocomplete/both") { <main class="p-6" scenario-autocomplete-both></main> }
            @case ("/autocomplete/inline") { <main class="p-6" scenario-autocomplete-inline></main> }
            @case ("/autocomplete/none") { <main class="p-6" scenario-autocomplete-none></main> }
            @case ("/autocomplete/groups") { <main class="p-6" scenario-autocomplete-groups></main> }
            @case ("/autocomplete/async") { <main class="p-6" scenario-autocomplete-async></main> }
            @case ("/autocomplete/field") { <main class="p-6" scenario-autocomplete-field></main> }
            @case ("/autocomplete/lifecycle") { <main class="p-6" scenario-autocomplete-lifecycle [cancel]="query.cancel"></main> }
            @case ("/select/basic") { <main class="p-6" scenario-select-basic></main> }
            @case ("/select/controlled") { <main class="p-6" scenario-select-controlled></main> }
            @case ("/select/modal") { <main class="p-6" scenario-select-modal></main> }
            @case ("/select/lifecycle") { <main class="p-6" scenario-select-lifecycle [cancel]="query.cancel"></main> }
            @case ("/select/groups") { <main class="p-6" scenario-select-groups></main> }
            @case ("/checkbox/basic") { <main class="p-6" scenario-checkbox-basic></main> }
            @case ("/checkbox/group") { <main class="p-6" scenario-checkbox-group></main> }
            @case ("/checkbox/controlled") { <main class="p-6" scenario-checkbox-controlled></main> }
            @case ("/checkbox/controlled-form") { <main class="p-6" scenario-checkbox-controlled-form></main> }
            @case ("/radio-group/basic") { <main class="p-6" scenario-radio-group-basic></main> }
            @case ("/radio-group/controlled") { <main class="p-6" scenario-radio-group-controlled></main> }
            @case ("/switch/basic") { <main class="p-6" scenario-switch-basic></main> }
            @case ("/switch/controlled") { <main class="p-6" scenario-switch-controlled></main> }
            @case ("/button/basic") { <main class="p-6" scenario-button-basic></main> }
            @case ("/slider/basic") { <main class="p-6" scenario-slider-basic></main> }
            @case ("/slider/range") { <main class="p-6" scenario-slider-range></main> }
            @case ("/slider/vertical") { <main class="p-6" scenario-slider-vertical></main> }
            @case ("/slider/rtl") { <main class="p-6" scenario-slider-basic></main> }
            @case ("/slider/controlled") { <main class="p-6" scenario-slider-controlled></main> }
            @case ("/slider/label-value") { <main class="p-6" scenario-slider-label-value></main> }
            @case ("/slider/thumb-name") { <main class="p-6" scenario-slider-thumb-name></main> }
            @case ("/field/basic") { <main class="p-6" scenario-field-basic></main> }
            @case ("/field/validation") { <main class="p-6" scenario-field-validation></main> }
            @case ("/field/controls") { <main class="p-6" scenario-field-controls></main> }
            @case ("/field/async") { <main class="p-6" scenario-field-async></main> }
            @case ("/field/async-blur") { <main class="p-6" scenario-field-async-blur></main> }
            @case ("/field/match") { <main class="p-6" scenario-field-match></main> }
            @case ("/field/more-controls") { <main class="p-6" scenario-field-more-controls></main> }
            @case ("/field/settings") { <main class="p-6" scenario-field-settings></main> }
            @case ("/fieldset/basic") { <main class="p-6" scenario-fieldset-basic></main> }
            @case ("/form/basic") { <main class="p-6" scenario-form-basic></main> }
            @case ("/calendar/single") { <main class="p-6" scenario-single-calendar [locale]="query.locale"></main> }
            @case ("/calendar/min-max") { <main class="p-6" scenario-single-calendar [locale]="query.locale" [min]="{ year: 2026, month: 11, day: 10 }" [max]="{ year: 2026, month: 12, day: 5 }"></main> }
            @case ("/calendar/unavailable") { <main class="p-6" scenario-single-calendar [locale]="query.locale" [isDateUnavailable]="isWeekend"></main> }
            @case ("/calendar/locale") { <main class="p-6" scenario-single-calendar [locale]="query.locale"></main> }
            @case ("/calendar/rtl") { <main class="p-6" scenario-single-calendar [locale]="query.locale"></main> }
            @case ("/calendar/two-months") { <main class="p-6" scenario-calendar-two-months [locale]="query.locale"></main> }
            @case ("/calendar/range") { <main class="p-6" scenario-calendar-range [locale]="query.locale"></main> }
            @case ("/date-picker/basic") { <main class="p-6" scenario-date-picker-basic [locale]="query.locale"></main> }
            @case ("/date-picker/range") { <main class="p-6" scenario-date-picker-range [locale]="query.locale"></main> }
            @case ("/date-picker/form") { <main class="p-6" scenario-date-picker-form></main> }
            @case ("/date-picker/mixed-form") { <main class="p-6" scenario-date-picker-mixed-form></main> }
            @case ("/date-picker/lifecycle") { <main class="p-6" scenario-date-picker-lifecycle [locale]="query.locale" [cancel]="query.cancel"></main> }
            @case ("/label/controls") { <main class="p-6" scenario-label-controls></main> }
            @case ("/listbox/single") { <main class="p-6" scenario-listbox-single></main> }
            @case ("/listbox/multiple") { <main class="p-6" scenario-listbox-multiple></main> }
            @case ("/listbox/replace") { <main class="p-6" scenario-listbox-replace></main> }
            @case ("/listbox/groups") { <main class="p-6" scenario-listbox-groups></main> }
            @case ("/listbox/horizontal") { <main class="p-6" scenario-listbox-horizontal></main> }
            @case ("/listbox/field") { <main class="p-6" scenario-listbox-field></main> }
            @case ("/meter/basic") { <main class="p-6" scenario-meter-basic></main> }
            @case ("/number-field/basic") { <main class="p-6" scenario-number-field-basic></main> }
            @case ("/number-field/field") { <main class="p-6" scenario-number-field-field></main> }
            @case ("/number-field/format") { <main class="p-6" scenario-number-field-format [locale]="query.locale"></main> }
            @case ("/number-field/scrub") { <main class="p-6" scenario-number-field-scrub></main> }
            @case ("/date-field/basic") { <main class="p-6" scenario-date-field-basic [locale]="query.locale"></main> }
            @case ("/date-field/min-max") { <main class="p-6" scenario-date-field-min-max></main> }
            @case ("/date-field/form") { <main class="p-6" scenario-date-field-form></main> }
            @case ("/date-field/date-time") { <main class="p-6" scenario-date-field-date-time [locale]="query.locale"></main> }
            @case ("/time-field/basic") { <main class="p-6" scenario-time-field-basic [locale]="query.locale"></main> }
            @case ("/time-field/min-max") { <main class="p-6" scenario-time-field-min-max></main> }
            @case ("/time-field/form") { <main class="p-6" scenario-time-field-form></main> }
            @case ("/otp-field/basic") { <main class="p-6" scenario-otp-field-basic></main> }
            @case ("/otp-field/field") { <main class="p-6" scenario-otp-field-field></main> }
            @case ("/progress/basic") { <main class="p-6" scenario-progress-basic></main> }
            @case ("/avatar/basic") { <main class="p-6" scenario-avatar-basic></main> }
            @case ("/separator/basic") { <main class="p-6" scenario-separator-basic></main> }
            @case ("/toggle/basic") { <main class="p-6" scenario-toggle-basic></main> }
            @case ("/toggle/controlled") { <main class="p-6" scenario-toggle-controlled></main> }
            @case ("/toggle-group/basic") { <main class="p-6" scenario-toggle-group-basic></main> }
            @case ("/toggle-group/vertical") { <main class="p-6" scenario-toggle-group-vertical></main> }
            @case ("/toolbar/basic") { <main class="p-6" scenario-toolbar-basic></main> }
            @case ("/toolbar/overlay") { <main class="p-6" scenario-toolbar-overlay></main> }
            @case ("/toolbar/vertical") { <main class="p-6" scenario-toolbar-vertical></main> }
            @case ("/menubar/basic") { <main class="p-6" scenario-menubar-basic></main> }
            @case ("/menubar/vertical") { <main class="p-6" scenario-menubar-vertical></main> }
            @case ("/menubar/modal") { <main class="p-6" scenario-menubar-modal></main> }
            @case ("/direction/provider") { <main class="p-6" scenario-direction-provider [directionProvider]="'rtl'"></main> }
            @case ("/listbox-virtual/basic") { <main class="p-6" scenario-listbox-virtual-basic></main> }
            @case ("/listbox-virtual/async") { <main class="p-6" scenario-listbox-virtual-async></main> }
            @case ("/select-virtual/basic") { <main class="p-6" scenario-select-virtual-basic></main> }
            @case ("/select-virtual/async") { <main class="p-6" scenario-select-virtual-async></main> }
            @case ("/combobox-virtual/basic") { <main class="p-6" scenario-combobox-virtual-basic></main> }
            @case ("/combobox-virtual/async") { <main class="p-6" scenario-combobox-virtual-async></main> }
            @case ("/autocomplete-virtual/basic") { <main class="p-6" scenario-autocomplete-virtual-basic></main> }
            @case ("/autocomplete-virtual/async") { <main class="p-6" scenario-autocomplete-virtual-async></main> }
            @case ("/toast/basic") { <main class="p-6" scenario-toast-basic toastProvider [toastManager]="notifications"></main> }
            @case ("/toast/limit") { <main class="p-6" scenario-toast-limit toastProvider [limit]="2" [timeout]="0"></main> }
            @case ("/toast/promise") { <main class="p-6" scenario-toast-promise toastProvider [timeout]="2000"></main> }
            @case ("/toast/swipe") { <main class="p-6" scenario-toast-swipe toastProvider [timeout]="0"></main> }
            @case ("/hover-card/basic") { <main class="p-6" scenario-hover-card-basic></main> }
            @case ("/hover-card/detached") { <main class="p-6" scenario-hover-card-detached></main> }
            @case ("/hover-card/in-dialog") { <main class="p-6" scenario-hover-card-in-dialog></main> }
            @case ("/hover-card/lifecycle") { <main class="p-6" scenario-hover-card-lifecycle [cancel]="query.cancel"></main> }
            @case ("/scroll-area/basic") { <main class="p-6" scenario-scroll-area-basic></main> }
            @case ("/scroll-area/links") { <main class="p-6" scenario-scroll-area-links></main> }
            @case ("/pagination/basic") { <main class="p-6" scenario-pagination-basic></main> }
            @case ("/pagination/links") { <main class="p-6" scenario-pagination-links></main> }
            @case ("/aspect-ratio/basic") { <main class="p-6" scenario-aspect-ratio-basic></main> }
            @default {
                <main class="p-6">
                    <h1 class="text-lg font-semibold">Angular fixture</h1>
                    <ul>
                        @for (route of routes; track route) {
                            <li><a [href]="route">{{ route }}</a></li>
                        }
                    </ul>
                </main>
            }
        }
    `,
})
export class App {
    // the document's location: the browser's, or the server render's URL (src/server)
    private readonly location = inject(DOCUMENT).location;
    protected readonly query = readQuery(this.location.search);
    protected readonly path = this.location.pathname;
    protected readonly routes = ROUTES;
    /** The `/toast/basic` queue, created in a plain module. */
    protected readonly notifications = notifications;

    /** The unavailable dates of `/calendar/unavailable`: weekends. */
    protected readonly isWeekend = (date: PlainDate) => {
        const day = new Date(date.year, date.month - 1, date.day).getDay();
        return day === 0 || day === 6;
    };

    constructor() {
        const html = inject(DOCUMENT).documentElement;
        // no `dir` unless the scenario asks for one (spec/direction.md: a document with none)
        if (this.query.dir === "rtl") {
            html.setAttribute("dir", "rtl");
        } else {
            html.removeAttribute("dir");
        }
        if (this.query.lang === undefined) {
            html.removeAttribute("lang");
        } else {
            html.setAttribute("lang", this.query.lang);
        }
    }
}
