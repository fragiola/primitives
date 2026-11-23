import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Link } from "@fragiola/primitives-angular/link";
import { link } from "examples-shared/recipes/link";
import { Output } from "../../kit/output.ts";

/** spec/link.md, `/link/basic` */
@Component({
    selector: "[scenario-link-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Link, Output],
    template: `
        <div [class]="styles.list">
            <a link href="#home" current [class]="styles.root" (click)="count()">Home</a>
            <a link href="#docs" [class]="styles.root" (click)="count()">Docs</a>
            <a link href="#archive" disabled [class]="styles.root" (click)="count()">Archive</a>
        </div>
        <pre fixtureOutput [values]="{ clicks: clicks() }"></pre>
    `,
})
export class LinkBasic {
    protected readonly styles = link;
    protected readonly clicks = signal(0);
    protected count(): void {
        this.clicks.update((current) => current + 1);
    }
}
