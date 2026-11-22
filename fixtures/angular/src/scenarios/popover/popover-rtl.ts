import { Component, ViewEncapsulation } from "@angular/core";
import { PlacedPopover } from "./placed-popover.ts";

@Component({
    selector: "[scenario-popover-rtl]",
    encapsulation: ViewEncapsulation.None,
    imports: [PlacedPopover],
    template: `
        <p class="my-4" placedPopover label="Inline end" side="inline-end"></p>
        <p class="my-4" placedPopover label="Left" side="left"></p>
    `,
})
export class PopoverRtl {}
