import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { HoverCardRoot } from "./hover-card-root.directive.ts";

export interface HoverCardPopupState {
    open: boolean;
    side: string;
    align: string;
    instant: boolean;
}

/**
 * The card (spec/hover-card.md): a non-modal layer (Escape, an outside press), which never takes
 * focus on open and closes when focus leaves it. `<div hoverCardPopup>`.
 */
@Directive({
    selector: "[hoverCardPopup]",
    exportAs: "hoverCardPopup",
    host: {
        tabindex: "-1",
        "data-primitives-part": "hover-card-popup",
        "[attr.id]": "root.overlay.popupId",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-instant]": "data().instant",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "(focusout)": "onFocusOut($event)",
    },
})
export class HoverCardPopup {
    protected readonly root = inject<HoverCardRoot>(HoverCardRoot);
    readonly state = computed<HoverCardPopupState>(() => ({
        open: this.root.overlay.open(),
        instant: this.root.instant(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() => {
        const status = this.root.overlay.presence.status();
        const state = this.state();
        return dataValues({
            ...state,
            closed: !state.open,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });
    private readonly popup = registerHost(this.root.overlay.popup);

    constructor() {
        const overlay = this.root.overlay;
        const popup = this.popup;
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const positioner = overlay.positioner();
            if (!open) {
                return;
            }
            untracked(() => {
                const session = openOverlaySession(popup.ownerDocument, {
                    elements: () => [positioner ?? popup],
                    ignore: () => untracked(overlay.triggers),
                    dismiss: (reason, event) =>
                        overlay.setOpen(false, reason, event),
                });
                onCleanup(session.end);
            });
        });
    }

    protected onFocusOut(event: FocusEvent): void {
        const overlay = this.root.overlay;
        const next = event.relatedTarget;
        if (
            !overlay.open() ||
            !(next instanceof Node) ||
            this.popup.contains(next) ||
            overlay.positioner()?.contains(next) ||
            overlay.triggers().some((trigger) => trigger.contains(next))
        ) {
            return;
        }
        overlay.setOpen(false, "focus-out", event);
    }
}
