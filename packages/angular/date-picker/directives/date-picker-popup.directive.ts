import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import { getTabbables, nextTabbableAfter } from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { DATE_PICKER } from "../utils/date-picker-state.ts";

export interface DatePickerPopupState {
    open: boolean;
    side: string;
    align: string;
}

// Closing by these returns focus to the trigger; focus leaving does not (spec/calendar.md, "Focus").
const RETURNS_FOCUS = new Set(["escape-key", "item-press", "trigger-press"]);
// an outside press returns it only when the press focused nothing (as Popover, D4 §3)
const RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);

/** The non-modal dialog holding the bound calendar (spec/calendar.md, pickers): `<div datePickerPopup>`. */
@Directive({
    selector: "[datePickerPopup]",
    exportAs: "datePickerPopup",
    host: {
        role: "dialog",
        "[attr.data-primitives-part]": "picker.part('popup')",
        "[attr.id]": "picker.overlay.popupId",
        "[attr.data-open]": "data().open",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "(keydown)": "onKeyDown($event)",
    },
})
export class DatePickerPopup {
    protected readonly picker = inject(DATE_PICKER);
    readonly state = computed<DatePickerPopupState>(() => ({
        open: this.picker.overlay.open(),
        ...this.picker.placed(),
    }));
    protected readonly data = computed(() => {
        const status = this.picker.overlay.presence.status();
        return dataValues({
            ...this.state(),
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });
    private readonly popup = registerHost(this.picker.overlay.popup);

    constructor() {
        const overlay = this.picker.overlay;
        const popup = this.popup;
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const positioner = overlay.positioner();
            const trigger = overlay.trigger();
            if (!open) {
                return;
            }
            // the bound calendar focuses its focused date itself (spec/calendar.md, "Focus")
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
                        to: () => trigger,
                    },
                });
                onCleanup(session.end);
            });
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key !== "Tab" || event.defaultPrevented) {
            return;
        }
        const overlay = this.picker.overlay;
        const popup = this.popup;
        const trigger = overlay.trigger();
        // in the tab order, the popup's content comes right after the trigger (as popover.md)
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
