import { computed, Directive, inject, input } from "@angular/core";
import {
    dataValues,
    overlayTrigger,
} from "@fragiola/primitives-angular/internal";
import type { HoverCardHandle } from "../utils/hover-card-handle.ts";
import { HoverCardRoot } from "./hover-card-root.directive.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

export interface HoverCardTriggerState {
    open: boolean;
}

/**
 * The link the card previews, and the anchor (spec/hover-card.md): `<a hoverCardTrigger href>`,
 * or anywhere with a handle (`[handle]`, `[payload]`, `id`).
 */
@Directive({
    selector: "[hoverCardTrigger]",
    exportAs: "hoverCardTrigger",
    host: {
        "data-primitives-part": "hover-card-trigger",
        "[attr.id]": "trigger.id()",
        "[attr.data-popup-open]": "data().open",
        "(pointerenter)": "onPointerEnter($event)",
        "(pointerleave)": "onPointerLeave($event)",
        "(focus)": "onFocus($event)",
        "(blur)": "trigger.root()?.blur(host, $event)",
    },
})
export class HoverCardTrigger<Payload = unknown> {
    /** The handle of a `[hoverCardRoot]` this trigger opens from anywhere. */
    readonly handle = input<HoverCardHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
    protected readonly trigger = overlayTrigger(
        inject<HoverCardRoot<Payload>>(HoverCardRoot, { optional: true }),
        this,
        { prefix: "primitives-hover-card", selector: "hoverCardTrigger" },
    );
    readonly state = computed<HoverCardTriggerState>(() => ({
        open: this.trigger.active(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly host = this.trigger.host;

    protected onPointerEnter(event: PointerEvent): void {
        // a tap follows the link: no card
        if (event.pointerType !== "touch") {
            this.trigger.root()?.intentStart("trigger-hover", this.host, event);
        }
    }

    protected onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== "touch") {
            this.trigger.root()?.hoverEnd(this.host);
        }
    }

    protected onFocus(event: FocusEvent): void {
        if (isFocusVisible(this.host)) {
            this.trigger.root()?.intentStart("trigger-focus", this.host, event);
        }
    }
}
