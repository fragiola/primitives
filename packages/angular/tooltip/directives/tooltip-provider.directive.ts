import { Directive, input } from "@angular/core";
import { createDelayGroup } from "@fragiola/primitives/hover";

/**
 * A delay group: shared delays and the instant hand-off (spec/tooltip.md, "Delay group"):
 * `<ng-container tooltipProvider [delay]="800">`. It renders no element.
 */
@Directive({ selector: "[tooltipProvider]", exportAs: "tooltipProvider" })
export class TooltipProvider {
    /** ms before a hovered trigger opens its tooltip. */
    readonly delay = input(600);
    /** ms before a tooltip closes once the pointer left. */
    readonly closeDelay = input(0);
    /** ms after a close during which another tooltip of the group opens at once. */
    readonly timeout = input(400);
    // one group for the provider's life, reading the current timeout: a change never leaves the
    // open member in the previous group
    private readonly delayGroup = createDelayGroup({
        timeout: () => this.timeout(),
    });
    /** The provider's delay group (a getter, as the tooltips read it). */
    readonly group = () => this.delayGroup;
}
