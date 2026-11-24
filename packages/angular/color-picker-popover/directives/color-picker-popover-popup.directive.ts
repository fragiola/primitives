import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import {
    focusInitial,
    getTabbables,
    nextTabbableAfter,
} from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ColorPickerPopoverRoot } from "./color-picker-popover-root.directive.ts";

export interface ColorPickerPopoverPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

// Closing by these returns focus to the trigger; focus leaving does not (spec/popover.md).
const RETURNS_FOCUS = new Set(["escape-key", "trigger-press"]);
// an outside press returns it only when the press focused nothing (D4 §3, Base UI), as a close
// made through the bound `open` (`none`) or the actions (`imperative-action`) does
const RETURNS_FOCUS_UNFOCUSED = new Set([
    "outside-press",
    "none",
    "imperative-action",
]);

/**
 * The picker's non-modal dialog (spec/color-picker.md, Popover's focus and dismissal):
 * `<div colorPickerPopoverPopup aria-label="...">`. Not trapped, it closes when focus leaves it;
 * on open, its first tabbable element takes the focus.
 */
@Directive({
    selector: "[colorPickerPopoverPopup]",
    exportAs: "colorPickerPopoverPopup",
    host: {
        role: "dialog",
        tabindex: "-1",
        "data-primitives-part": "color-picker-popover-popup",
        "[attr.id]": "root.overlay.popupId",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "(keydown)": "onKeyDown($event)",
    },
})
export class ColorPickerPopoverPopup {
    protected readonly root = inject(ColorPickerPopoverRoot);
    readonly state = computed<ColorPickerPopoverPopupState>(() => ({
        open: this.root.overlay.open(),
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
            const trigger = overlay.trigger();
            if (!open) {
                return;
            }
            untracked(() => {
                const session = openOverlaySession(popup.ownerDocument, {
                    elements: () => [positioner ?? popup],
                    ignore: () => [trigger],
                    dismiss: (reason, event) =>
                        overlay.setOpen(false, reason, event),
                    focusOut: () => [trigger],
                    returnFocus: {
                        when: RETURNS_FOCUS,
                        whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                        reason: () => overlay.lastReason.current ?? "none",
                        to: () => trigger,
                    },
                });
                onCleanup(session.end);
            });
        });
        // on open: the first tabbable element, else the popup (D4 §3 "Popover focus on open")
        afterRenderEffect(() => {
            if (overlay.open()) {
                untracked(() => focusInitial(popup, undefined));
            }
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key !== "Tab" || event.defaultPrevented) {
            return;
        }
        const overlay = this.root.overlay;
        const popup = this.popup;
        const trigger = overlay.trigger();
        // in the tab order, the popup's content comes right after the trigger (as popover.md)
        const tabbables = getTabbables(popup);
        const active = popup.ownerDocument.activeElement;
        const first = tabbables[0] ?? popup;
        const last = tabbables.at(-1) ?? popup;
        if (event.shiftKey && (active === first || active === popup)) {
            event.preventDefault();
            overlay.setOpen(false, "focus-out", event);
            trigger?.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            const next = trigger
                ? nextTabbableAfter(trigger, [overlay.positioner(), popup])
                : null;
            overlay.setOpen(false, "focus-out", event);
            next?.focus();
        }
    }
}
