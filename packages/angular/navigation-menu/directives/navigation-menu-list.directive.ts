import { Directive, inject } from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import {
    injectHost,
    injectProvidedDirection,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

const ITEM_TARGETS =
    ':scope > [data-primitives-part="navigation-menu-item"] > :is([data-primitives-part="navigation-menu-trigger"], [data-primitives-part="navigation-menu-link"])';

/**
 * The items (spec/navigation-menu.md, "Keyboard"): `<ul navigationMenuList>`. The arrow keys along
 * the orientation move focus between the items' Triggers and Links (mirrored in RTL), Home and End
 * to the ends.
 */
@Directive({
    selector: "[navigationMenuList]",
    exportAs: "navigationMenuList",
    host: {
        "data-primitives-part": "navigation-menu-list",
        "[attr.data-orientation]": "root.orientation()",
        "(keydown)": "onKeyDown($event)",
    },
})
export class NavigationMenuList {
    protected readonly root = inject(NavigationMenuRoot);
    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();

    protected onKeyDown(event: KeyboardEvent): void {
        const targets = [
            ...this.host.querySelectorAll<HTMLElement>(ITEM_TARGETS),
        ].filter((target) => !(target as HTMLButtonElement).disabled);
        const index = targets.indexOf(event.target as HTMLElement);
        if (index === -1 || event.defaultPrevented) {
            return;
        }
        const rtl = getDirection(this.host, this.direction()) === "rtl";
        const loop = this.root.loopFocus();
        const [next, previous] =
            this.root.orientation() === "horizontal"
                ? rtl
                    ? ["ArrowLeft", "ArrowRight"]
                    : ["ArrowRight", "ArrowLeft"]
                : ["ArrowDown", "ArrowUp"];
        let target: number | null = null;
        if (event.key === next) {
            target = index + 1 < targets.length ? index + 1 : loop ? 0 : index;
        } else if (event.key === previous) {
            target = index > 0 ? index - 1 : loop ? targets.length - 1 : index;
        } else if (event.key === "Home") {
            target = 0;
        } else if (event.key === "End") {
            target = targets.length - 1;
        }
        if (target === null) {
            return;
        }
        event.preventDefault();
        targets[target]?.focus();
    }
}
