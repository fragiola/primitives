import { computed, Directive, inject, input } from "@angular/core";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

export interface NavigationMenuPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/**
 * Places the popup next to the open item's Trigger (spec/navigation-menu.md, "Positioning"):
 * `<div navigationMenuPositioner>`.
 */
@Directive({
    selector: "[navigationMenuPositioner]",
    exportAs: "navigationMenuPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "navigation-menu-positioner",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[style.--positioner-width]": "width()",
        "[style.--positioner-height]": "height()",
    },
})
export class NavigationMenuPositioner {
    protected readonly root = inject(NavigationMenuRoot);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(undefined);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed<NavigationMenuPositionerState>(() => ({
        open: this.root.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() =>
        dataValues({ ...this.state(), closed: !this.state().open }),
    );
    protected readonly width = computed(() => {
        const size = this.root.size();
        return size ? `${size.width}px` : null;
    });
    protected readonly height = computed(() => {
        const size = this.root.size();
        return size ? `${size.height}px` : null;
    });

    constructor() {
        const root = this.root;
        const positioner = registerHost(root.positioner);
        positionOverlay(
            this,
            { side: "bottom", align: "center" },
            {
                anchor: root.activeTrigger,
                positioner,
                arrow: root.arrow,
                mounted: root.presence.mounted,
            },
            root.placed,
        );
    }
}
