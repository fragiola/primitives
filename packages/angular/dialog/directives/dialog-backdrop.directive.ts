import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    untracked,
} from "@angular/core";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import { DialogRoot } from "./dialog-root.directive.ts";

export interface DialogBackdropState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

/**
 * The layer behind the popup: `<div dialogBackdrop>`. A nested dialog's renders nothing (its
 * element leaves the page) unless `forceRender` (spec/dialog.md, "Nested dialogs").
 */
@Directive({
    selector: "[dialogBackdrop]",
    exportAs: "dialogBackdrop",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "dialog-backdrop",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-nested]": "data().nested",
        "[attr.data-nested-dialog-open]": "data()['nested-dialog-open']",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
    },
})
export class DialogBackdrop {
    protected readonly root = inject<DialogRoot>(DialogRoot);
    /** A nested dialog's Backdrop renders only with it (default `false`). */
    readonly forceRender = input(false, { transform: booleanAttribute });
    readonly state = computed<DialogBackdropState>(() => {
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
    private readonly rendered = computed(
        () => !this.root.nested || this.forceRender(),
    );

    constructor() {
        const host = injectHost();
        const root = this.root;
        effect((onCleanup) => {
            if (!this.rendered()) {
                return;
            }
            untracked(() => root.backdrop.set(host));
            onCleanup(() => {
                if (untracked(root.backdrop) === host) {
                    root.backdrop.set(null);
                }
            });
        });
        // the element leaves the page while it renders nothing, a placeholder keeping its place;
        // after rendering, once the portal has moved it
        let placeholder: Comment | null = null;
        afterRenderEffect(() => {
            const rendered = this.rendered();
            untracked(() => {
                if (!rendered && host.isConnected) {
                    placeholder ??= host.ownerDocument.createComment("");
                    host.replaceWith(placeholder);
                } else if (rendered && placeholder?.isConnected) {
                    placeholder.replaceWith(host);
                }
            });
        });
        inject(DestroyRef).onDestroy(() => placeholder?.remove());
    }
}
