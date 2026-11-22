import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { DialogRootBase } from "./dialog-root-base.ts";

export interface DialogViewportState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

/**
 * The container the popup sits in, covering the page (spec/dialog.md, "Anatomy"): a press on it
 * outside the popup is an outside press. `<div dialogViewport>` inside the Portal, around the
 * `[dialogPopup]`.
 */
@Directive({
    selector: "[dialogViewport]",
    exportAs: "dialogViewport",
    host: {
        role: "presentation",
        "[attr.data-primitives-part]": "root.part('viewport')",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-nested]": "data().nested",
        "[attr.data-nested-dialog-open]": "data()['nested-dialog-open']",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
    },
})
export class DialogViewport {
    protected readonly root = inject<DialogRootBase>(DialogRootBase);
    readonly state = computed<DialogViewportState>(() => {
        const { open, nested, nestedDialogOpen } = this.root.state();
        return { open, nested, nestedDialogOpen };
    });
    protected readonly data = computed(() => {
        const status = this.root.overlay.presence.status();
        const state = this.state();
        return dataValues({
            open: state.open,
            closed: !state.open,
            nested: state.nested,
            "nested-dialog-open": state.nestedDialogOpen,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });

    constructor() {
        registerHost(this.root.viewport);
    }
}
