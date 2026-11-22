import { Component, signal, ViewEncapsulation } from "@angular/core";
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { Output } from "../../kit/output.ts";
import { NAVIGATION_MENU_PARTS } from "./navigation-menu-parts.ts";

/** spec/navigation-menu.md: a site header with two disclosed panels and a link. */
@Component({
    selector: "[scenario-navigation-menu-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [NAVIGATION_MENU_PARTS, Output],
    template: `
        <nav navigationMenuRoot aria-label="Main" [class]="styles.root" (valueChangeDetails)="value.set($event.value); reason.set($event.details.reason)">
            <ul navigationMenuList [class]="styles.list">
                <li navigationMenuItem [value]="'products'" [class]="styles.item">
                    <button navigationMenuTrigger [class]="styles.trigger">Products<span navigationMenuIcon [class]="styles.icon"></span></button>
                    <div *navigationMenuContent [class]="styles.content">
                        <ul [class]="styles['content-list']">
                            <li><a navigationMenuLink href="#analytics" [active]="true" [class]="styles['content-link']">Analytics</a></li>
                            <li><a navigationMenuLink href="#automation" [class]="styles['content-link']">Automation</a></li>
                            <li><a navigationMenuLink href="#reports" [class]="styles['content-link']">Reports</a></li>
                        </ul>
                    </div>
                </li>
                <li navigationMenuItem [value]="'learn'" [class]="styles.item">
                    <button navigationMenuTrigger [class]="styles.trigger">Learn<span navigationMenuIcon [class]="styles.icon"></span></button>
                    <div *navigationMenuContent [class]="styles.content">
                        <ul [class]="styles['content-grid']">
                            <li><a navigationMenuLink href="#guides" [class]="styles['content-link']">Guides</a></li>
                            <li><a navigationMenuLink href="#blog" [class]="styles['content-link']">Blog</a></li>
                            <li><a navigationMenuLink href="#videos" [class]="styles['content-link']">Videos</a></li>
                            <li><a navigationMenuLink href="#community" [class]="styles['content-link']">Community</a></li>
                        </ul>
                    </div>
                </li>
                <li navigationMenuItem [class]="styles.item">
                    <a navigationMenuLink href="#pricing" [class]="styles.link">Pricing</a>
                </li>
            </ul>
            <ng-container *navigationMenuPortal>
                <div navigationMenuPositioner [sideOffset]="8" [class]="styles.positioner">
                    <div navigationMenuPopup [class]="styles.popup">
                        <div navigationMenuArrow [class]="styles.arrow"></div>
                        <div navigationMenuViewport [class]="styles.viewport"></div>
                    </div>
                </div>
            </ng-container>
        </nav>
        <button type="button" class="mt-40">Outside button</button>
        <pre fixtureOutput [values]="{ value: value(), reason: reason() }"></pre>
    `,
})
export class NavigationMenuBasic {
    protected readonly styles = navigationMenu;
    protected readonly value = signal<string | null>(null);
    protected readonly reason = signal<string | undefined>(undefined);
}
