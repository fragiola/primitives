import { computed, Directive, inject, input } from "@angular/core";
import {
    dataValues,
    overlayTrigger,
} from "@fragiola/primitives-angular/internal";
import type { TooltipHandle } from "../utils/tooltip-handle.ts";
import { TooltipRoot } from "./tooltip-root.directive.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

export interface TooltipTriggerState {
    open: boolean;
}

/**
 * A described control and the anchor (spec/tooltip.md): `<button tooltipTrigger>`, or anywhere
 * with a handle (`[handle]`, `[payload]`, `id`).
 */
@Directive({
    selector: "[tooltipTrigger]",
    exportAs: "tooltipTrigger",
    host: {
        type: "button",
        "data-primitives-part": "tooltip-trigger",
        "[attr.id]": "trigger.id()",
        "[attr.aria-describedby]": "describedBy()",
        "[attr.data-popup-open]": "data().open",
        "(pointerenter)": "onPointerEnter($event)",
        "(pointerleave)": "onPointerLeave($event)",
        // a tap neither opens nor blocks it (the block ends on a pointer leave touch has not)
        "(pointerdown)":
            "$event.pointerType === 'touch' || trigger.root()?.press($event)",
        "(focus)": "onFocus($event)",
        "(blur)": "onBlur($event)",
    },
})
export class TooltipTrigger<Payload = unknown> {
    /** The handle of a `[tooltipRoot]` this trigger describes from anywhere. */
    readonly handle = input<TooltipHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
    protected readonly trigger = overlayTrigger(
        inject<TooltipRoot<Payload>>(TooltipRoot, { optional: true }),
        this,
        { prefix: "primitives-tooltip", selector: "tooltipTrigger" },
    );
    readonly state = computed<TooltipTriggerState>(() => ({
        open: this.trigger.active(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    private readonly host = this.trigger.host;
    /** The consumer's own description, kept before the tooltip's. */
    private readonly ownDescription =
        this.host.getAttribute("aria-describedby");
    protected readonly describedBy = computed(
        () =>
            [
                this.ownDescription,
                this.state().open ? this.trigger.root()?.overlay.popupId : null,
            ]
                .filter(Boolean)
                .join(" ") || null,
    );

    protected onPointerEnter(event: PointerEvent): void {
        // a tap never opens a tooltip
        if (event.pointerType !== "touch") {
            this.trigger.root()?.hoverStart(this.host, event);
        }
    }

    protected onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== "touch") {
            this.trigger.root()?.hoverEnd(this.host);
        }
    }

    protected onFocus(event: FocusEvent): void {
        const root = this.trigger.root();
        if (root && !root.disabled() && isFocusVisible(this.host)) {
            root.show("trigger-focus", true, event, this.host);
        }
    }

    protected onBlur(event: FocusEvent): void {
        if (this.state().open) {
            this.trigger.root()?.hide("trigger-focus", event);
        }
    }
}
