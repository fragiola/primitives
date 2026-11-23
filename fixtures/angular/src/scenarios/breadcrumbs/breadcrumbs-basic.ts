import { Component, ViewEncapsulation } from "@angular/core";
import { breadcrumbs } from "examples-shared/recipes/breadcrumbs";
import { BREADCRUMBS_PARTS } from "./breadcrumbs-parts.ts";

/** spec/breadcrumbs.md, `/breadcrumbs/basic` */
@Component({
    selector: "[scenario-breadcrumbs-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [BREADCRUMBS_PARTS],
    template: `
        <nav breadcrumbsRoot aria-label="Breadcrumb" [class]="styles.root">
            <ol breadcrumbsList [class]="styles.list">
                <li breadcrumbsItem [class]="styles.item"><a breadcrumbsLink href="#home" [class]="styles.link">Home</a></li>
                <li breadcrumbsSeparator [class]="styles.separator">/</li>
                <li breadcrumbsItem [class]="styles.item"><a breadcrumbsLink href="#docs" [class]="styles.link">Docs</a></li>
                <li breadcrumbsSeparator [class]="styles.separator">/</li>
                <li breadcrumbsItem [class]="styles.item"><a breadcrumbsLink href="#components" disabled [class]="styles.link">Components</a></li>
                <li breadcrumbsSeparator [class]="styles.separator">/</li>
                <li breadcrumbsItem [class]="styles.item"><a breadcrumbsLink href="#breadcrumbs" current [class]="styles.link">Breadcrumbs</a></li>
            </ol>
        </nav>
    `,
})
export class BreadcrumbsBasic {
    protected readonly styles = breadcrumbs;
}
