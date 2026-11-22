import { computed, Directive, inject, input } from "@angular/core";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { PopoverRoot } from "./popover-root.directive.ts";

export interface PopoverPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/** Places the popup next to its anchor (spec/popover.md, "Positioning"): `<div popoverPositioner>`. */
@Directive({
    selector: "[popoverPositioner]",
    exportAs: "popoverPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "popover-positioner",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class PopoverPositioner {
    protected readonly root = inject<PopoverRoot>(PopoverRoot);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(undefined);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed<PopoverPositionerState>(() => ({
        open: this.root.overlay.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() =>
        dataValues({ ...this.state(), closed: !this.state().open }),
    );

    constructor() {
        const overlay = this.root.overlay;
        const positioner = registerHost(overlay.positioner);
        positionOverlay(
            this,
            { side: "bottom", align: "center" },
            {
                anchor: overlay.trigger,
                positioner,
                arrow: this.root.arrow,
                mounted: overlay.presence.mounted,
            },
            this.root.placed,
        );
    }
}
