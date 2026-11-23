import { computed, Directive, inject, input } from "@angular/core";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { HoverCardRoot } from "./hover-card-root.directive.ts";

/** Places the popup next to its anchor (spec/hover-card.md, "Positioning"): `<div hoverCardPositioner>`. */
@Directive({
    selector: "[hoverCardPositioner]",
    exportAs: "hoverCardPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "hover-card-positioner",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class HoverCardPositioner {
    protected readonly root = inject<HoverCardRoot>(HoverCardRoot);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(undefined);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() =>
        dataValues({ ...this.state(), closed: !this.state().open }),
    );

    constructor() {
        const overlay = this.root.overlay;
        positionOverlay(
            this,
            { side: "bottom", align: "center" },
            {
                anchor: overlay.trigger,
                positioner: registerHost(overlay.positioner),
                arrow: this.root.arrow,
                mounted: overlay.presence.mounted,
            },
            this.root.placed,
        );
    }
}
