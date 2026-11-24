import { computed, Directive, inject, input } from "@angular/core";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ColorPickerPopoverRoot } from "./color-picker-popover-root.directive.ts";

export interface ColorPickerPopoverPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/**
 * Places the popup next to the trigger, below it and aligned to its start (a picker's default):
 * `<div colorPickerPopoverPositioner>`.
 */
@Directive({
    selector: "[colorPickerPopoverPositioner]",
    exportAs: "colorPickerPopoverPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "color-picker-popover-positioner",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class ColorPickerPopoverPositioner {
    protected readonly root = inject(ColorPickerPopoverRoot);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(undefined);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed<ColorPickerPopoverPositionerState>(() => ({
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
            { side: "bottom", align: "start" },
            {
                anchor: overlay.trigger,
                positioner: registerHost(overlay.positioner),
                mounted: overlay.presence.mounted,
            },
            this.root.placed,
        );
    }
}
