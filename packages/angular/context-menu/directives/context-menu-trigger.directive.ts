import { afterRenderEffect, computed, Directive, inject } from "@angular/core";
import { watchLongPress } from "@fragiola/primitives/pointer";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ContextMenuRoot } from "./context-menu-root.directive.ts";

export interface ContextMenuTriggerState {
    open: boolean;
    disabled: boolean;
}

// The keyboard's own `contextmenu` event follows the key that opened the menu within this time.
const KEYBOARD_EVENT_WINDOW = 300;

/** A key that opens a context menu from the keyboard (spec/context-menu.md, "Keyboard"). */
function isMenuKey(event: KeyboardEvent): boolean {
    return (
        event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)
    );
}

/**
 * The area a right-click, a touch long press, or the `ContextMenu` key and Shift+F10 open the
 * menu from (spec/context-menu.md): no button, no role. `<div contextMenuTrigger>`.
 */
@Directive({
    selector: "[contextMenuTrigger]",
    exportAs: "contextMenuTrigger",
    host: {
        "data-primitives-part": "context-menu-trigger",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(contextmenu)": "onContextMenu($event)",
        "(keydown)": "onKeyDown($event)",
        "(keyup)": "onKeyUp($event)",
    },
})
export class ContextMenuTrigger {
    private readonly root = inject(ContextMenuRoot);
    private readonly host = registerHost(this.root.overlay.singleTrigger);
    private keyboardAt = Number.NEGATIVE_INFINITY;
    readonly state = computed<ContextMenuTriggerState>(() => ({
        open: this.root.overlay.open(),
        disabled: this.root.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = this.host;
        // a touch held still for 500 ms opens it at the press point
        afterRenderEffect((onCleanup) => {
            if (this.root.disabled()) {
                return;
            }
            onCleanup(
                watchLongPress(host, {
                    onLongPress: (point, event) =>
                        this.root.openAt(
                            point,
                            "trigger-press",
                            event,
                            host,
                            null,
                        ),
                }),
            );
        });
    }

    private inArea(target: EventTarget | null): boolean {
        return target instanceof Node && this.host.contains(target);
    }

    protected onContextMenu(event: MouseEvent): void {
        if (this.root.disabled() || !this.inArea(event.target)) {
            return;
        }
        event.preventDefault();
        // the browser's own event after a key that already opened the menu
        if (event.timeStamp - this.keyboardAt < KEYBOARD_EVENT_WINDOW) {
            return;
        }
        this.root.openAt(
            { x: event.clientX, y: event.clientY },
            "trigger-press",
            event,
            this.host,
            null,
        );
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (
            this.root.disabled() ||
            !isMenuKey(event) ||
            !this.inArea(event.target)
        ) {
            return;
        }
        event.preventDefault();
        this.keyboardAt = event.timeStamp;
        const focused = this.host.ownerDocument.activeElement;
        this.root.openAt(
            focused !== null && this.host.contains(focused)
                ? focused
                : this.host,
            "list-navigation",
            event,
            this.host,
            "first",
        );
    }

    protected onKeyUp(event: KeyboardEvent): void {
        // some platforms send the menu key's `contextmenu` on its release
        if (
            !this.root.disabled() &&
            isMenuKey(event) &&
            this.inArea(event.target)
        ) {
            this.keyboardAt = event.timeStamp;
        }
    }
}
