import { computed, Directive, inject, input } from "@angular/core";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { DATE_PICKER } from "../utils/date-picker-state.ts";

export interface DatePickerPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/** Places the popup next to the trigger (spec/calendar.md, "Positioning"): `<div datePickerPositioner>`. */
@Directive({
    selector: "[datePickerPositioner]",
    exportAs: "datePickerPositioner",
    host: {
        role: "presentation",
        "[attr.data-primitives-part]": "picker.part('positioner')",
        "[attr.data-open]": "data().open",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class DatePickerPositioner {
    protected readonly picker = inject(DATE_PICKER);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(undefined);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed<DatePickerPositionerState>(() => ({
        open: this.picker.overlay.open(),
        ...this.picker.placed(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const overlay = this.picker.overlay;
        positionOverlay(
            this,
            { side: "bottom", align: "start" },
            {
                anchor: overlay.trigger,
                positioner: registerHost(overlay.positioner),
            },
            this.picker.placed,
        );
    }
}
