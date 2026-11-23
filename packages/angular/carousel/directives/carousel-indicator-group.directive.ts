import { computed, Directive, inject } from "@angular/core";
import { tabsKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    injectHost,
    injectProvidedDirection,
} from "@fragiola/primitives-angular/internal";
import { CarouselRoot } from "./carousel-root.directive.ts";

/**
 * The slide picker controls (spec/carousel.md): `<div carouselIndicatorGroup aria-label="Choose
 * slide to display">`, a `group` of buttons, or in the tabbed variant a `tablist` with the APG
 * tabs' keys (automatic activation, wrapping), as Tabs' List.
 */
@Directive({
    selector: "[carouselIndicatorGroup]",
    exportAs: "carouselIndicatorGroup",
    host: {
        "data-primitives-part": "carousel-indicator-group",
        "[attr.role]": "tabbed() ? 'tablist' : 'group'",
        "[attr.aria-orientation]": "tabbed() ? root.orientation() : null",
        "[attr.data-orientation]": "root.orientation()",
        "(keydown)": "onKeyDown($event)",
    },
})
export class CarouselIndicatorGroup {
    protected readonly root = inject(CarouselRoot);
    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    protected readonly tabbed = computed(
        () => this.root.variant() === "tabbed",
    );
    readonly state = this.root.state;

    protected onKeyDown(event: KeyboardEvent): void {
        if (!this.tabbed()) {
            return;
        }
        const tabs = [
            ...this.host.querySelectorAll<HTMLElement>('[role="tab"]'),
        ];
        const current = tabs.indexOf(event.target as HTMLElement);
        if (current === -1) {
            return;
        }
        const index = tabsKeyTarget(event.key, current, tabs.length, {
            orientation: this.root.orientation(),
            rtl: getDirection(this.host, this.direction()) === "rtl",
            loop: true,
        });
        if (index === null) {
            return;
        }
        event.preventDefault();
        tabs[index]?.focus();
        this.root.setPage(index, { reason: "keyboard", event });
    }
}
