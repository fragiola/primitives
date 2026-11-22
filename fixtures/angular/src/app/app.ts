import { Component, ViewEncapsulation } from "@angular/core";
import { readQuery } from "../kit/query.ts";
import { CheckboxBasic } from "../scenarios/checkbox/checkbox-basic.ts";
import { CheckboxControlled } from "../scenarios/checkbox/checkbox-controlled.ts";
import { CheckboxGroupScenario } from "../scenarios/checkbox/checkbox-group.ts";
import { ComboboxBasic } from "../scenarios/combobox/combobox-basic.ts";
import { ComboboxControlled } from "../scenarios/combobox/combobox-controlled.ts";
import { ComboboxField } from "../scenarios/combobox/combobox-field.ts";
import { ComboboxFiltered } from "../scenarios/combobox/combobox-filtered.ts";
import { ComboboxForm } from "../scenarios/combobox/combobox-form.ts";
import { ComboboxGroups } from "../scenarios/combobox/combobox-groups.ts";
import { ComboboxMultiple } from "../scenarios/combobox/combobox-multiple.ts";
import { ComboboxObjects } from "../scenarios/combobox/combobox-objects.ts";
import { ComboboxRejectedInput } from "../scenarios/combobox/combobox-rejected-input.ts";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.ts";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.ts";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.ts";
import { DialogNestedPopover } from "../scenarios/dialog/dialog-nested-popover.ts";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.ts";
import { FieldBasic } from "../scenarios/field/field-basic.ts";
import { FieldControls } from "../scenarios/field/field-controls.ts";
import { FieldValidation } from "../scenarios/field/field-validation.ts";
import { MenuBasic } from "../scenarios/menu/menu-basic.ts";
import { MenuGroups } from "../scenarios/menu/menu-groups.ts";
import { MenuModal } from "../scenarios/menu/menu-modal.ts";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.ts";
import { PopoverArrow } from "../scenarios/popover/popover-arrow.ts";
import { PopoverBasic } from "../scenarios/popover/popover-basic.ts";
import { PopoverInitialFocus } from "../scenarios/popover/popover-initial-focus.ts";
import { PopoverPlacement } from "../scenarios/popover/popover-placement.ts";
import { PopoverRtl } from "../scenarios/popover/popover-rtl.ts";
import { SelectBasic } from "../scenarios/select/select-basic.ts";
import { SelectControlled } from "../scenarios/select/select-controlled.ts";
import { SelectModal } from "../scenarios/select/select-modal.ts";
import { SliderBasic } from "../scenarios/slider/slider-basic.ts";
import { SliderControlled } from "../scenarios/slider/slider-controlled.ts";
import { SliderRange } from "../scenarios/slider/slider-range.ts";
import { SliderVertical } from "../scenarios/slider/slider-vertical.ts";
import { SettingsTabs } from "../scenarios/tabs/settings-tabs.ts";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.ts";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.ts";
import { TooltipInDialog } from "../scenarios/tooltip/tooltip-in-dialog.ts";
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
        SettingsTabs,
        PopoverBasic,
        PopoverInitialFocus,
        PopoverPlacement,
        PopoverRtl,
        PopoverArrow,
        TooltipBasic,
        TooltipGroup,
        TooltipInDialog,
        MenuBasic,
        MenuSubmenu,
        MenuGroups,
        MenuModal,
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
        FieldBasic,
        FieldControls,
        FieldValidation,
        SelectBasic,
        SelectControlled,
        SelectModal,
        SliderBasic,
        SliderControlled,
        SliderRange,
        SliderVertical,
    ],
    template: `
        @switch (path) {
            @case ("/dialog/basic") { <main class="p-6" scenario-dialog-basic></main> }
            @case ("/dialog/initial-focus") { <main class="p-6" scenario-dialog-initial-focus></main> }
            @case ("/dialog/nested-popover") { <main class="p-6" scenario-dialog-nested-popover></main> }
            @case ("/dialog/controlled") { <main class="p-6" scenario-dialog-controlled></main> }
            @case ("/dialog/rejected-close") { <main class="p-6" scenario-dialog-rejected-close></main> }
            @case ("/tabs/automatic") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="horizontal"></main> }
            @case ("/tabs/manual") { <main class="p-6" scenario-settings-tabs activation="manual" orientation="horizontal"></main> }
            @case ("/tabs/vertical") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="vertical"></main> }
            @case ("/popover/basic") { <main class="p-6" scenario-popover-basic></main> }
            @case ("/popover/initial-focus") { <main class="p-6" scenario-popover-initial-focus></main> }
            @case ("/popover/placement") { <main class="p-6" scenario-popover-placement></main> }
            @case ("/popover/rtl") { <main class="p-6" scenario-popover-rtl></main> }
            @case ("/popover/arrow") { <main class="p-6" scenario-popover-arrow></main> }
            @case ("/tooltip/basic") { <main class="p-6" scenario-tooltip-basic></main> }
            @case ("/tooltip/group") { <main class="p-6" scenario-tooltip-group></main> }
            @case ("/tooltip/in-dialog") { <main class="p-6" scenario-tooltip-in-dialog></main> }
            @case ("/menu/basic") { <main class="p-6" scenario-menu-basic></main> }
            @case ("/menu/submenu") { <main class="p-6" scenario-menu-submenu></main> }
            @case ("/menu/groups") { <main class="p-6" scenario-menu-groups></main> }
            @case ("/menu/modal") { <main class="p-6" scenario-menu-modal></main> }
            @case ("/combobox/basic") { <main class="p-6" scenario-combobox-basic></main> }
            @case ("/combobox/controlled") { <main class="p-6" scenario-combobox-controlled></main> }
            @case ("/combobox/rejected-input") { <main class="p-6" scenario-combobox-rejected-input></main> }
            @case ("/combobox/filtered") { <main class="p-6" scenario-combobox-filtered></main> }
            @case ("/combobox/objects") { <main class="p-6" scenario-combobox-objects></main> }
            @case ("/combobox/multiple") { <main class="p-6" scenario-combobox-multiple></main> }
            @case ("/combobox/groups") { <main class="p-6" scenario-combobox-groups></main> }
            @case ("/combobox/form") { <main class="p-6" scenario-combobox-form></main> }
            @case ("/combobox/field") { <main class="p-6" scenario-combobox-field></main> }
            @case ("/select/basic") { <main class="p-6" scenario-select-basic></main> }
            @case ("/select/controlled") { <main class="p-6" scenario-select-controlled></main> }
            @case ("/select/modal") { <main class="p-6" scenario-select-modal></main> }
            @case ("/checkbox/basic") { <main class="p-6" scenario-checkbox-basic></main> }
            @case ("/checkbox/group") { <main class="p-6" scenario-checkbox-group></main> }
            @case ("/checkbox/controlled") { <main class="p-6" scenario-checkbox-controlled></main> }
            @case ("/slider/basic") { <main class="p-6" scenario-slider-basic></main> }
            @case ("/slider/range") { <main class="p-6" scenario-slider-range></main> }
            @case ("/slider/vertical") { <main class="p-6" scenario-slider-vertical></main> }
            @case ("/slider/rtl") { <main class="p-6" scenario-slider-basic></main> }
            @case ("/slider/controlled") { <main class="p-6" scenario-slider-controlled></main> }
            @case ("/field/basic") { <main class="p-6" scenario-field-basic></main> }
            @case ("/field/validation") { <main class="p-6" scenario-field-validation></main> }
            @case ("/field/controls") { <main class="p-6" scenario-field-controls></main> }
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
    protected readonly query = readQuery(window.location.search);
    protected readonly path = window.location.pathname;
    protected readonly routes = ROUTES;

    constructor() {
        document.documentElement.dir = this.query.dir;
        document.documentElement.lang = this.query.locale;
    }
}
