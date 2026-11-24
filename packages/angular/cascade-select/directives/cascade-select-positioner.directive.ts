import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    input,
    untracked,
} from "@angular/core";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { CascadeSelectRoot } from "./cascade-select-root.directive.ts";

const NEVER = new Set<string>();

/**
 * Places the popup below the trigger, as Select's (spec/cascade-select.md, "Positioning"); the
 * open popup is a layer (Escape, outside press): `<div cascadeSelectPositioner>`.
 */
@Directive({
    selector: "[cascadeSelectPositioner]",
    exportAs: "cascadeSelectPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "cascade-select-positioner",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class CascadeSelectPositioner {
    protected readonly root = inject(CascadeSelectRoot);
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
    protected readonly data = computed(() =>
        dataValues({ ...this.state(), closed: !this.state().open }),
    );

    constructor() {
        const overlay = this.root.overlay;
        const positioner = registerHost(overlay.positioner);
        positionOverlay(
            this,
            { side: "bottom", align: "start" },
            {
                anchor: overlay.trigger,
                positioner,
                mounted: overlay.presence.mounted,
            },
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
                    dismiss: (reason, event) =>
                        overlay.setOpen(false, reason, event),
                    returnFocus: {
                        when: NEVER,
                        reason: () => overlay.lastReason.current,
                        to: () => trigger,
                    },
                });
                onCleanup(session.end);
            });
        });
    }
}
