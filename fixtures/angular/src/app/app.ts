import { Component, ViewEncapsulation } from "@angular/core";
import { readQuery } from "../kit/query.ts";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.ts";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.ts";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.ts";
import { DialogNestedPopover } from "../scenarios/dialog/dialog-nested-popover.ts";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.ts";
import { MenuBasic } from "../scenarios/menu/menu-basic.ts";
import { MenuGroups } from "../scenarios/menu/menu-groups.ts";
import { MenuModal } from "../scenarios/menu/menu-modal.ts";
import { MenuSubmenu } from "../scenarios/menu/menu-submenu.ts";
import { PopoverArrow } from "../scenarios/popover/popover-arrow.ts";
import { PopoverBasic } from "../scenarios/popover/popover-basic.ts";
import { PopoverInitialFocus } from "../scenarios/popover/popover-initial-focus.ts";
import { PopoverPlacement } from "../scenarios/popover/popover-placement.ts";
import { PopoverRtl } from "../scenarios/popover/popover-rtl.ts";
import { SettingsTabs } from "../scenarios/tabs/settings-tabs.ts";
import { TooltipBasic } from "../scenarios/tooltip/tooltip-basic.ts";
import { TooltipGroup } from "../scenarios/tooltip/tooltip-group.ts";
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
        MenuBasic,
        MenuSubmenu,
        MenuGroups,
        MenuModal,
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
            @case ("/menu/basic") { <main class="p-6" scenario-menu-basic></main> }
            @case ("/menu/submenu") { <main class="p-6" scenario-menu-submenu></main> }
            @case ("/menu/groups") { <main class="p-6" scenario-menu-groups></main> }
            @case ("/menu/modal") { <main class="p-6" scenario-menu-modal></main> }
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
