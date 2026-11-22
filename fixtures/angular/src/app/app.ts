import { DOCUMENT } from "@angular/common";
import { Component, inject, ViewEncapsulation } from "@angular/core";
import type { PlainDate } from "@fragiola/primitives-angular/calendar";
import { DirectionProvider } from "@fragiola/primitives-angular/direction";
import { readQuery } from "../kit/query.ts";
import { AccordionBasic } from "../scenarios/accordion/accordion-basic.ts";
import { AccordionHorizontal } from "../scenarios/accordion/accordion-horizontal.ts";
import { AccordionMultiple } from "../scenarios/accordion/accordion-multiple.ts";
import { AlertDialogBasic } from "../scenarios/alert-dialog/alert-dialog-basic.ts";
import { AlertDialogDetached } from "../scenarios/alert-dialog/alert-dialog-detached.ts";
import { AlertDialogLifecycle } from "../scenarios/alert-dialog/alert-dialog-lifecycle.ts";
import { AvatarBasic } from "../scenarios/avatar/avatar-basic.ts";
import { ButtonBasic } from "../scenarios/button/button-basic.ts";
import { CalendarRange } from "../scenarios/calendar/calendar-range.ts";
import { CalendarTwoMonths } from "../scenarios/calendar/calendar-two-months.ts";
import { SingleCalendar } from "../scenarios/calendar/single-calendar.ts";
import { CheckboxBasic } from "../scenarios/checkbox/checkbox-basic.ts";
import { CheckboxControlled } from "../scenarios/checkbox/checkbox-controlled.ts";
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
import { DatePickerBasic } from "../scenarios/date-picker/date-picker-basic.ts";
import { DatePickerForm } from "../scenarios/date-picker/date-picker-form.ts";
import { DatePickerLifecycle } from "../scenarios/date-picker/date-picker-lifecycle.ts";
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
import { FieldAsync } from "../scenarios/field/field-async.ts";
import { FieldBasic } from "../scenarios/field/field-basic.ts";
import { FieldControls } from "../scenarios/field/field-controls.ts";
import { FieldMatch } from "../scenarios/field/field-match.ts";
import { FieldMoreControls } from "../scenarios/field/field-more-controls.ts";
import { FieldSettings } from "../scenarios/field/field-settings.ts";
import { FieldValidation } from "../scenarios/field/field-validation.ts";
import { FieldsetBasic } from "../scenarios/fieldset/fieldset-basic.ts";
import { FormBasic } from "../scenarios/form/form-basic.ts";
import { MenuBasic } from "../scenarios/menu/menu-basic.ts";
import { MenuCheckboxRadio } from "../scenarios/menu/menu-checkbox-radio.ts";
import { MenuControlled } from "../scenarios/menu/menu-controlled.ts";
import { MenuDetached } from "../scenarios/menu/menu-detached.ts";
import { MenuGroups } from "../scenarios/menu/menu-groups.ts";
import { MenuLifecycle } from "../scenarios/menu/menu-lifecycle.ts";
import { MenuModal } from "../scenarios/menu/menu-modal.ts";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.ts";
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
import { SliderVertical } from "../scenarios/slider/slider-vertical.ts";
import { SwitchBasic } from "../scenarios/switch/switch-basic.ts";
import { SwitchControlled } from "../scenarios/switch/switch-controlled.ts";
import { SettingsTabs } from "../scenarios/tabs/settings-tabs.ts";
import { TabsAnimated } from "../scenarios/tabs/tabs-animated.ts";
import { TabsNoneSelected } from "../scenarios/tabs/tabs-none-selected.ts";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.ts";
import { TooltipDetached } from "../scenarios/tooltip/tooltip-detached.ts";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.ts";
import { TooltipInDialog } from "../scenarios/tooltip/tooltip-in-dialog.ts";
import { TooltipLifecycle } from "../scenarios/tooltip/tooltip-lifecycle.ts";
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
        AlertDialogBasic,
        AlertDialogDetached,
        AlertDialogLifecycle,
        SettingsTabs,
        TabsNoneSelected,
        TabsAnimated,
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
        MenuCheckboxRadio,
        ContextMenuBasic,
        ContextMenuLifecycle,
        CheckboxBasic,
        CheckboxControlled,
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
        DatePickerLifecycle,
        SliderLabelValue,
        FieldAsync,
        FieldMatch,
        FieldMoreControls,
        FieldsetBasic,
        FormBasic,
        DirectionProvider,
        DirectionProviderScenario,
        AvatarBasic,
        ButtonBasic,
        FieldSettings,
        ProgressBasic,
        RadioGroupBasic,
        RadioGroupControlled,
        SeparatorBasic,
        SwitchBasic,
        SwitchControlled,
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
            @case ("/alert-dialog/basic") { <main class="p-6" scenario-alert-dialog-basic></main> }
            @case ("/alert-dialog/detached") { <main class="p-6" scenario-alert-dialog-detached></main> }
            @case ("/alert-dialog/lifecycle") { <main class="p-6" scenario-alert-dialog-lifecycle [cancel]="query.cancel"></main> }
            @case ("/tabs/automatic") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="horizontal"></main> }
            @case ("/tabs/manual") { <main class="p-6" scenario-settings-tabs activation="manual" orientation="horizontal"></main> }
            @case ("/tabs/vertical") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="vertical"></main> }
            @case ("/tabs/none-selected") { <main class="p-6" scenario-tabs-none-selected></main> }
            @case ("/tabs/animated") { <main class="p-6" scenario-tabs-animated></main> }
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
            @case ("/select/basic") { <main class="p-6" scenario-select-basic></main> }
            @case ("/select/controlled") { <main class="p-6" scenario-select-controlled></main> }
            @case ("/select/modal") { <main class="p-6" scenario-select-modal></main> }
            @case ("/select/lifecycle") { <main class="p-6" scenario-select-lifecycle [cancel]="query.cancel"></main> }
            @case ("/select/groups") { <main class="p-6" scenario-select-groups></main> }
            @case ("/checkbox/basic") { <main class="p-6" scenario-checkbox-basic></main> }
            @case ("/checkbox/group") { <main class="p-6" scenario-checkbox-group></main> }
            @case ("/checkbox/controlled") { <main class="p-6" scenario-checkbox-controlled></main> }
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
            @case ("/field/basic") { <main class="p-6" scenario-field-basic></main> }
            @case ("/field/validation") { <main class="p-6" scenario-field-validation></main> }
            @case ("/field/controls") { <main class="p-6" scenario-field-controls></main> }
            @case ("/field/async") { <main class="p-6" scenario-field-async></main> }
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
            @case ("/date-picker/lifecycle") { <main class="p-6" scenario-date-picker-lifecycle [locale]="query.locale" [cancel]="query.cancel"></main> }
            @case ("/progress/basic") { <main class="p-6" scenario-progress-basic></main> }
            @case ("/avatar/basic") { <main class="p-6" scenario-avatar-basic></main> }
            @case ("/separator/basic") { <main class="p-6" scenario-separator-basic></main> }
            @case ("/direction/provider") { <main class="p-6" scenario-direction-provider [directionProvider]="'rtl'"></main> }
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
