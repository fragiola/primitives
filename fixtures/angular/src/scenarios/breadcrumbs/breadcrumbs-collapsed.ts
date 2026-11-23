import { Component, signal, ViewEncapsulation } from "@angular/core";
import { breadcrumbs } from "examples-shared/recipes/breadcrumbs";
import { menu } from "examples-shared/recipes/menu";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "../menu/menu-parts.ts";
import { BREADCRUMBS_PARTS } from "./breadcrumbs-parts.ts";

/**
 * spec/breadcrumbs.md, `/breadcrumbs/collapsed`: the Ellipsis and a Menu's trigger on the same
 * button (no trigger class, as React's `render={<Menu.Trigger />}`).
 */
@Component({
    selector: "[scenario-breadcrumbs-collapsed]",
    encapsulation: ViewEncapsulation.None,
    imports: [BREADCRUMBS_PARTS, MENU_PARTS, Output],
    template: `
        <nav breadcrumbsRoot aria-label="Breadcrumb" [class]="styles.root">
            <ol breadcrumbsList [class]="styles.list">
                <li breadcrumbsItem [class]="styles.item"><a breadcrumbsLink href="#home" [class]="styles.link">Home</a></li>
                <li breadcrumbsSeparator [class]="styles.separator">/</li>
                <li breadcrumbsItem [class]="styles.item">
                    <ng-container menuRoot>
                        <button menuTrigger breadcrumbsEllipsis aria-label="Show the hidden pages" [class]="styles.ellipsis">…</button>
                        <ng-container *menuPortal>
                            <div menuPositioner [sideOffset]="4" [class]="menuStyles.positioner">
                                <div menuPopup [class]="menuStyles.popup">
                                    <div menuItem [class]="menuStyles.item" (click)="chosen.set('Docs')">Docs</div>
                                    <div menuItem [class]="menuStyles.item" (click)="chosen.set('Components')">Components</div>
                                </div>
                            </div>
                        </ng-container>
                    </ng-container>
                </li>
                <li breadcrumbsSeparator [class]="styles.separator">/</li>
                <li breadcrumbsItem [class]="styles.item"><a breadcrumbsLink href="#guides" [class]="styles.link">Guides</a></li>
                <li breadcrumbsSeparator [class]="styles.separator">/</li>
                <li breadcrumbsItem [class]="styles.item"><span breadcrumbsCurrent [class]="styles.current">Routing</span></li>
            </ol>
        </nav>
        <pre fixtureOutput [values]="{ chosen: chosen() }"></pre>
    `,
})
export class BreadcrumbsCollapsed {
    protected readonly styles = breadcrumbs;
    protected readonly menuStyles = menu;
    protected readonly chosen = signal<string | undefined>(undefined);
}
