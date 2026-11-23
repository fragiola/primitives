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
    isInHoverBridge,
    watchPointerExit,
} from "@fragiola/primitives/pointer";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

export interface NavigationMenuPopupState {
    open: boolean;
    side: string;
    align: string;
}

const RETURNS_FOCUS = new Set(["escape-key"]);

/**
 * The shared popup (spec/navigation-menu.md): `<div navigationMenuPopup>`. A non-modal layer of the
 * overlay tree while a Content is open, sized by the open Content (`--popup-width`,
 * `--popup-height`); the pointer leaving it and the Trigger, or the document at once, closes a
 * hover-opened Content after the close delay.
 */
@Directive({
    selector: "[navigationMenuPopup]",
    exportAs: "navigationMenuPopup",
    host: {
        "data-primitives-part": "navigation-menu-popup",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "[style.--popup-width]": "width()",
        "[style.--popup-height]": "height()",
        "(keydown)": "onKeyDown($event)",
    },
})
export class NavigationMenuPopup {
    protected readonly root = inject(NavigationMenuRoot);
    readonly state = computed<NavigationMenuPopupState>(() => ({
        open: this.root.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() => {
        const status = this.root.presence.status();
        const state = this.state();
        return dataValues({
            ...state,
            closed: !state.open,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });
    protected readonly width = computed(() => {
        const size = this.root.size();
        return size ? `${size.width}px` : null;
    });
    protected readonly height = computed(() => {
        const size = this.root.size();
        return size ? `${size.height}px` : null;
    });
    private readonly popup = registerHost(this.root.popup);

    constructor() {
        const root = this.root;
        const popup = this.popup;
        afterRenderEffect((onCleanup) => {
            const open = root.open();
            const positioner = root.positioner();
            if (!open) {
                return;
            }
            untracked(() => {
                const doc = popup.ownerDocument;
                const own = positioner ?? popup;
                // the open item may switch while it is open: read when the session needs it
                const session = openOverlaySession(doc, {
                    elements: () => [own],
                    // a press on the Root's List is its own (a Trigger toggles or switches)
                    ignore: () => [root.element],
                    owner: () => [untracked(root.activeTrigger)],
                    dismiss: (reason, event) => {
                        root.setValue(null, reason, event);
                        root.flush();
                    },
                    focusOut: () => [root.element],
                    returnFocus: {
                        when: RETURNS_FOCUS,
                        reason: () => root.lastReason.current ?? "none",
                        // only when focus was inside the popup (APG: the button keeps its focus)
                        to: () =>
                            own.contains(doc.activeElement)
                                ? untracked(root.activeTrigger)
                                : false,
                    },
                });
                root.layered.set(true);
                // a hover-opened Content: the pointer leaving the Trigger and the popup (and the
                // levels opened from it), or the document at once (the window or the iframe),
                // closes it after the close delay
                const hoverOpened = () =>
                    root.openedBy.by === "hover" &&
                    untracked(root.activeTrigger) !== null;
                const onMove = (event: PointerEvent) => {
                    const trigger = untracked(root.activeTrigger);
                    if (
                        event.pointerType === "touch" ||
                        !hoverOpened() ||
                        trigger === null
                    ) {
                        return;
                    }
                    const target = event.target;
                    const inside =
                        isInHoverBridge(
                            { x: event.clientX, y: event.clientY },
                            trigger,
                            own,
                        ) ||
                        (target instanceof Node &&
                            session
                                .elementsAbove()
                                .some((element) => element.contains(target)));
                    if (inside) {
                        root.hover.cancel();
                    } else {
                        root.hover.leave(untracked(root.closeDelay));
                    }
                };
                doc.addEventListener("pointermove", onMove);
                const stopExit = watchPointerExit(doc, () => {
                    if (hoverOpened()) {
                        root.hover.leave(untracked(root.closeDelay));
                    }
                });
                onCleanup(() => {
                    root.layered.set(false);
                    doc.removeEventListener("pointermove", onMove);
                    stopExit();
                    // a close delay still pending would close a later opening
                    root.hover.cancel();
                    session.end();
                });
            });
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const trigger = this.root.activeTrigger();
        const popup = this.popup;
        if (
            event.key !== "Tab" ||
            trigger === null ||
            event.defaultPrevented ||
            !popup.contains(event.target as Node)
        ) {
            return;
        }
        const tabbables = getTabbables(popup);
        const active = popup.ownerDocument.activeElement;
        if (event.shiftKey && active === tabbables[0]) {
            event.preventDefault();
            trigger.focus();
        } else if (!event.shiftKey && active === tabbables.at(-1)) {
            // in the tab order, the Content comes right after its Trigger
            const next = nextTabbableAfter(trigger, [
                this.root.positioner(),
                popup,
            ]);
            if (next) {
                event.preventDefault();
                next.focus();
            }
        }
    }
}
