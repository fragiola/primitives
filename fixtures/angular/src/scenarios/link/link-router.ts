import {
    Component,
    Directive,
    input,
    output,
    signal,
    ViewEncapsulation,
} from "@angular/core";
import { Link } from "@fragiola/primitives-angular/link";
import { link } from "examples-shared/recipes/link";
import { Output } from "../../kit/output.ts";

/**
 * The fixture's router link (spec/link.md, `/link/router`): an anchor whose plain click the router
 * takes over, as Angular's `RouterLink` does (it does not check `defaultPrevented`).
 */
@Directive({
    selector: "a[fixtureRouterLink]",
    host: {
        "[attr.href]": "fixtureRouterLink()",
        "(click)": "follow($event)",
    },
})
class FixtureRouterLink {
    readonly fixtureRouterLink = input.required<string>();
    readonly navigate = output<string>();
    protected follow(event: Event): void {
        event.preventDefault();
        this.navigate.emit(this.fixtureRouterLink());
    }
}

/** spec/link.md, `/link/router` */
@Component({
    selector: "[scenario-link-router]",
    encapsulation: ViewEncapsulation.None,
    imports: [Link, FixtureRouterLink, Output],
    template: `
        <div [class]="styles.list">
            <a link fixtureRouterLink="/settings" [class]="styles.root" (navigate)="route.set($event)">Settings</a>
            <a link fixtureRouterLink="/billing" disabled [class]="styles.root" (navigate)="route.set($event)">Billing</a>
        </div>
        <pre fixtureOutput [values]="{ route: route() }"></pre>
    `,
})
export class LinkRouter {
    protected readonly styles = link;
    protected readonly route = signal("/");
}
