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
import { ComboboxRoot } from "./combobox-root.directive.ts";

/**
 * Places the list under the InputGroup (else the Chips, else the Input); the open list is a layer
 * (Escape, outside press): `<div comboboxPositioner>`.
 */
@Directive({
    selector: "[comboboxPositioner]",
    exportAs: "comboboxPositioner",
    host: {
        role: "presentation",
        "data-primitives-part": "combobox-positioner",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class ComboboxPositioner {
    protected readonly root = inject(ComboboxRoot);
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
        const root = this.root;
        const overlay = root.overlay;
        const positioner = registerHost(overlay.positioner);
        positionOverlay(
            this,
            { side: "bottom", align: "start" },
            {
                anchor: computed(
                    () =>
                        root.inputGroup() ?? root.chips() ?? overlay.trigger(),
                ),
                positioner,
                mounted: overlay.presence.mounted,
            },
            root.placed,
        );
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const ignored = [
                overlay.trigger(),
                root.button(),
                root.inputGroup(),
                root.chips(),
                root.clearButton(),
            ];
            if (!open) {
                return;
            }
            untracked(() => {
                const session = openOverlaySession(positioner.ownerDocument, {
                    elements: () => [positioner],
                    ignore: () => ignored,
                    dismiss: (reason, event) =>
                        root.setOpen(false, reason, event),
                });
                onCleanup(session.end);
            });
        });
    }
}
