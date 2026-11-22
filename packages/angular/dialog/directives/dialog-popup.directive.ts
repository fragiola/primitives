import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    input,
    untracked,
} from "@angular/core";
import { focusInitial, trapFocus } from "@fragiola/primitives/focus";
import { inertOutside } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import {
    dataValues,
    type FocusTarget,
    registerHost,
    resolveFocusTarget,
} from "@fragiola/primitives-angular/internal";
import { DIALOG_NESTING } from "../utils/dialog-nesting.ts";
import { DialogRoot } from "./dialog-root.directive.ts";

export interface DialogPopupState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

// a press on the backdrop or the viewport blurs the page: focus returns once the press has ended
const RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);

/**
 * The modal dialog (spec/dialog.md): focus trap, inert page, scroll lock, its own layer.
 * `<div dialogPopup [initialFocus]="cancel">`. A `[dialogRoot]` inside it is a nested dialog;
 * its inline `--nested-dialogs` counts the open dialogs nested below it.
 */
@Directive({
    selector: "[dialogPopup]",
    exportAs: "dialogPopup",
    providers: [
        {
            provide: DIALOG_NESTING,
            useFactory: () => inject<DialogRoot>(DialogRoot).nesting,
        },
    ],
    host: {
        role: "dialog",
        "aria-modal": "true",
        tabindex: "-1",
        "data-primitives-part": "dialog-popup",
        "[attr.id]": "root.overlay.popupId",
        "[attr.aria-labelledby]": "root.titleId() ?? null",
        "[attr.aria-describedby]": "root.descriptionId() ?? null",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[style.--nested-dialogs]": "root.nestedDialogs()",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-nested]": "data().nested",
        "[attr.data-nested-dialog-open]": "data()['nested-dialog-open']",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
    },
})
export class DialogPopup {
    protected readonly root = inject<DialogRoot>(DialogRoot);
    /** Focused on open (default: the first tabbable element, else the popup). */
    readonly initialFocus = input<FocusTarget>(undefined);
    /** Focused on close (default: the active trigger, else the element focused before opening). */
    readonly finalFocus = input<FocusTarget>(undefined);
    readonly state = computed<DialogPopupState>(() => {
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
        const popup = registerHost(this.root.overlay.popup);
        const root = this.root;
        const overlay = root.overlay;
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const backdrop = root.backdrop();
            const viewport = root.viewport();
            if (!open) {
                return;
            }
            untracked(() => {
                const doc = popup.ownerDocument;
                const previous =
                    doc.activeElement instanceof HTMLElement
                        ? doc.activeElement
                        : null;
                // the triggers are read when the session needs them: a trigger registered later,
                // or the active one moving, never restarts it
                const session = openOverlaySession(doc, {
                    elements: () => [popup],
                    owner: () => untracked(overlay.triggers),
                    // a press on the backdrop or the viewport is outside this dialog, inside its
                    // parent
                    backdrops: () => [backdrop, viewport],
                    dismiss: (reason, event) =>
                        overlay.setOpen(false, reason, event),
                    returnFocus: {
                        whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                        reason: () => overlay.lastReason.current ?? "none",
                        to: () => {
                            const final = resolveFocusTarget(
                                untracked(this.finalFocus),
                            );
                            return final === false
                                ? false
                                : (final ??
                                      untracked(overlay.trigger) ??
                                      previous);
                        },
                    },
                });
                const initial = resolveFocusTarget(this.initialFocus());
                focusInitial(popup, initial === false ? popup : initial);
                const release = trapFocus(popup, session.elementsAbove);
                const unlock = lockScroll(doc);
                const restoreInert = inertOutside(
                    backdrop ? [popup, backdrop] : [popup],
                );
                onCleanup(() => {
                    release();
                    unlock();
                    restoreInert();
                    session.end();
                });
            });
        });
    }
}
