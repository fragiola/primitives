import { Component, ViewEncapsulation } from "@angular/core";
import { readQuery } from "../kit/query.ts";
import { DialogBasic } from "../scenarios/dialog/dialog-basic.ts";
import { DialogControlled } from "../scenarios/dialog/dialog-controlled.ts";
import { DialogInitialFocus } from "../scenarios/dialog/dialog-initial-focus.ts";
import { DialogRejectedClose } from "../scenarios/dialog/dialog-rejected-close.ts";
import { SettingsTabs } from "../scenarios/tabs/settings-tabs.ts";
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
        SettingsTabs,
    ],
    template: `
        @switch (path) {
            @case ("/dialog/basic") { <main class="p-6" scenario-dialog-basic></main> }
            @case ("/dialog/initial-focus") { <main class="p-6" scenario-dialog-initial-focus></main> }
            @case ("/dialog/controlled") { <main class="p-6" scenario-dialog-controlled></main> }
            @case ("/dialog/rejected-close") { <main class="p-6" scenario-dialog-rejected-close></main> }
            @case ("/tabs/automatic") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="horizontal"></main> }
            @case ("/tabs/manual") { <main class="p-6" scenario-settings-tabs activation="manual" orientation="horizontal"></main> }
            @case ("/tabs/vertical") { <main class="p-6" scenario-settings-tabs activation="automatic" orientation="vertical"></main> }
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
