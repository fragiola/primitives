import { Component, signal, ViewEncapsulation } from "@angular/core";
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { Output } from "../../kit/output.ts";
import { NAVIGATION_MENU_PARTS } from "./navigation-menu-parts.ts";

/** spec/navigation-menu.md: a nested, vertical level inside the Products Content. */
@Component({
    selector: "[scenario-navigation-menu-nested]",
    encapsulation: ViewEncapsulation.None,
    imports: [NAVIGATION_MENU_PARTS, Output],
    template: `
        <nav navigationMenuRoot aria-label="Main" [class]="styles.root" (valueChange)="value.set($event)">
            <ul navigationMenuList [class]="styles.list">
                <li navigationMenuItem [value]="'products'" [class]="styles.item">
                    <button navigationMenuTrigger [class]="styles.trigger">Products<span navigationMenuIcon [class]="styles.icon"></span></button>
                    <div *navigationMenuContent [class]="styles.content">
                        <div navigationMenuRoot [orientation]="'vertical'" [class]="styles.root" (valueChange)="nested.set($event)">
                            <ul navigationMenuList [class]="styles.list">
                                <li navigationMenuItem [value]="'developers'" [class]="styles.item">
                                    <button navigationMenuTrigger [class]="styles.trigger">Developers<span navigationMenuIcon [class]="styles.icon"></span></button>
                                    <div *navigationMenuContent [class]="styles.content">
                                        <ul [class]="styles['content-list']">
                                            <li><a navigationMenuLink href="#api" [class]="styles['content-link']">API</a></li>
                                            <li><a navigationMenuLink href="#sdks" [class]="styles['content-link']">SDKs</a></li>
                                        </ul>
                                    </div>
                                </li>
                                <li navigationMenuItem [class]="styles.item">
                                    <a navigationMenuLink href="#teams" [class]="styles.link">Teams</a>
                                </li>
                            </ul>
                            <ng-container *navigationMenuPortal>
                                <div navigationMenuPositioner [side]="'inline-end'" [sideOffset]="8" [class]="styles.positioner">
                                    <div navigationMenuPopup [class]="styles.popup">
                                        <div navigationMenuViewport [class]="styles.viewport"></div>
                                    </div>
                                </div>
                            </ng-container>
                        </div>
                    </div>
                </li>
                <li navigationMenuItem [class]="styles.item">
                    <a navigationMenuLink href="#pricing" [class]="styles.link">Pricing</a>
                </li>
            </ul>
            <ng-container *navigationMenuPortal>
                <div navigationMenuPositioner [sideOffset]="8" [class]="styles.positioner">
                    <div navigationMenuPopup [class]="styles.popup">
                        <div navigationMenuViewport [class]="styles.viewport"></div>
                    </div>
                </div>
            </ng-container>
        </nav>
        <pre fixtureOutput [values]="{ value: value(), nested: nested() }"></pre>
    `,
})
export class NavigationMenuNested {
    protected readonly styles = navigationMenu;
    protected readonly value = signal<string | null>(null);
    protected readonly nested = signal<string | null>(null);
}
