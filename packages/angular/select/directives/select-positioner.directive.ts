import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    input,
    untracked,
} from "@angular/core";
import { blockOutsidePointer } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { SelectRoot } from "./select-root.directive.ts";

// a modal select's outside press reaches nothing: the press would leave focus on the body, so it
// goes back to the trigger, which keeps it (spec/select.md, "Modal")
const MODAL_RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);
const NEVER = new Set<string>();

/**
 * Places the list below the trigger (spec/select.md, "Item alignment"); the open list is a layer
 * (Escape, outside press): `<div selectPositioner>`.
 */
@Directive({
    selector: "[selectPositioner]",
    exportAs: "selectPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "select-positioner",
        // a modal select blocks the pointer outside; its list takes it back (spec/select.md)
        "[style.pointer-events]": "root.modal() ? 'auto' : null",
        "[attr.data-open]": "data().open",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class SelectPositioner {
    protected readonly root = inject(SelectRoot);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(4);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const overlay = this.root.overlay;
        const positioner = registerHost(overlay.positioner);
        positionOverlay(
            this,
            { side: "bottom", align: "start" },
            { anchor: overlay.trigger, positioner },
            this.root.placed,
        );
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const trigger = overlay.trigger();
            if (!open) {
                return;
            }
            untracked(() => {
                const session = openOverlaySession(positioner.ownerDocument, {
                    elements: () => [positioner],
                    ignore: () => [trigger],
                    dismiss: (reason) => overlay.setOpen(false, reason),
                    returnFocus: {
                        when: NEVER,
                        whenUnfocused: () =>
                            untracked(this.root.modal)
                                ? MODAL_RETURNS_FOCUS_UNFOCUSED
                                : undefined,
                        reason: () => overlay.lastReason.current,
                        to: () => trigger,
                    },
                });
                onCleanup(session.end);
            });
        });
        // spec/select.md, "Modal": the scroll lock and the outside pointer block, on their own, so
        // toggling `modal` while open keeps the session as it is
        afterRenderEffect((onCleanup) => {
            if (!overlay.open() || !this.root.modal()) {
                return;
            }
            const doc = positioner.ownerDocument;
            const unlock = lockScroll(doc);
            const unblock = blockOutsidePointer(doc);
            onCleanup(() => {
                unblock();
                unlock();
            });
        });
    }
}
