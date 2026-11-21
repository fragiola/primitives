import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    input,
    untracked,
} from "@angular/core";
import {
    focusInitial,
    getTabbables,
    nextTabbableAfter,
} from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import {
    dataValues,
    type FocusTarget,
    registerHost,
    resolveFocusTarget,
} from "@fragiola/primitives-angular/internal";
import { PopoverRoot } from "./popover-root.directive.ts";

export interface PopoverPopupState {
    open: boolean;
    side: string;
    align: string;
}

// Closing by these returns focus to the trigger; focus leaving does not (spec/popover.md).
const RETURNS_FOCUS = new Set(["escape-key", "close-press", "trigger-press"]);
// an outside press returns it only when the press focused nothing (D4 §3, Base UI)
const RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);

/**
 * The non-modal popover (spec/popover.md): `<div popoverPopup>`. Not trapped: it closes when focus
 * leaves it.
 */
@Directive({
    selector: "[popoverPopup]",
    exportAs: "popoverPopup",
    host: {
        role: "dialog",
        tabindex: "-1",
        "data-primitives-part": "popover-popup",
        "[attr.id]": "root.overlay.popupId",
        "[attr.aria-labelledby]": "root.titleId() ?? null",
        "[attr.aria-describedby]": "root.descriptionId() ?? null",
        "[attr.data-open]": "data().open",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "(keydown)": "onKeyDown($event)",
    },
})
export class PopoverPopup {
    protected readonly root = inject(PopoverRoot);
    /** Focused on open (default: the first tabbable element, else the popup; `false`: none). */
    readonly initialFocus = input<FocusTarget>(undefined);
    /** Focused when focus returns on close (default: the trigger). */
    readonly finalFocus = input<FocusTarget>(undefined);
    readonly state = computed<PopoverPopupState>(() => ({
        open: this.root.overlay.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() => {
        const status = this.root.overlay.presence.status();
        return dataValues({
            ...this.state(),
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
            const trigger = overlay.trigger();
            if (!open) {
                return;
            }
            untracked(() => {
                const session = openOverlaySession(popup.ownerDocument, {
                    elements: () => [positioner ?? popup],
                    ignore: () => [trigger],
                    dismiss: (reason) => overlay.setOpen(false, reason),
                    focusOut: () => [trigger],
                    returnFocus: {
                        when: RETURNS_FOCUS,
                        whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                        reason: () => overlay.lastReason.current,
                        to: () => {
                            const final = resolveFocusTarget(this.finalFocus());
                            return final === false ? false : (final ?? trigger);
                        },
                    },
                });
                const initial = resolveFocusTarget(this.initialFocus());
                if (initial !== false) {
                    // the first tabbable element, else the popup (D4 §3 "Popover focus on open")
                    focusInitial(popup, initial);
                }
                onCleanup(session.end);
            });
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key !== "Tab" || event.defaultPrevented) {
            return;
        }
        const overlay = this.root.overlay;
        const popup = this.popup;
        const trigger = overlay.trigger();
        // in the tab order, the popup's content comes right after the trigger
        const tabbables = getTabbables(popup);
        const active = popup.ownerDocument.activeElement;
        const first = tabbables[0] ?? popup;
        const last = tabbables.at(-1) ?? popup;
        if (event.shiftKey && (active === first || active === popup)) {
            event.preventDefault();
            overlay.setOpen(false, "focus-out");
            trigger?.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            const next = trigger
                ? nextTabbableAfter(trigger, [overlay.positioner(), popup])
                : null;
            overlay.setOpen(false, "focus-out");
            next?.focus();
        }
    }
}
