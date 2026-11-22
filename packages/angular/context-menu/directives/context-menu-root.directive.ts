import {
    booleanAttribute,
    Directive,
    forwardRef,
    input,
    output,
    untracked,
} from "@angular/core";
import { virtualAnchor } from "@fragiola/primitives/positioning";
import type {
    ChangeReason,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
import {
    type MenuComponent,
    MenuRootBase,
} from "@fragiola/primitives-angular/menu";

/** A point in the viewport's (client) coordinates. */
export interface ContextMenuPoint {
    x: number;
    y: number;
}

/** An element focus may return to: still in the document, and not disabled. */
function focusable(element: HTMLElement | null): HTMLElement | null {
    return element?.isConnected === true && !element.matches(":disabled")
        ? element
        : null;
}

/**
 * Holds the state of a context menu's root level (spec/context-menu.md); adds nothing to its
 * element: `<ng-container contextMenuRoot [(open)]="open">`. Its parts are Menu's directives
 * under their own selectors, named `context-menu-*`; its trigger is an area
 * (`[contextMenuTrigger]`). `close()` and `unmount()` are its actions (`#menu="contextMenuRoot"`).
 */
@Directive({
    selector: "[contextMenuRoot]",
    exportAs: "contextMenuRoot",
    providers: [
        {
            provide: MenuRootBase,
            useExisting: forwardRef(() => ContextMenuRoot),
        },
    ],
})
export class ContextMenuRoot extends MenuRootBase {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Arrow keys wrap at the ends (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`: the APG menu button is non-modal; spec/menu.md, "Modal"). A submenu follows its
     * root menu's.
     */
    readonly modal = input(false, { transform: booleanAttribute });
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();

    /** The area opens nothing, and the browser's own menu shows (default `false`). */
    readonly disabled = input(false, { transform: booleanAttribute });
    // the element that had focus when the menu opened: focus returns to it
    private opener: HTMLElement | null = null;

    override get component(): MenuComponent {
        return "context-menu";
    }

    /** The element focused when the menu opened, while it can take focus back. */
    override returnTarget(): HTMLElement | null {
        return focusable(this.opener);
    }

    /**
     * Opens the menu at a point (a right-click, a long press) or anchored to an element (the
     * keyboard), from the trigger area, highlighting the first item or none.
     */
    openAt(
        at: ContextMenuPoint | Element,
        reason: ChangeReason,
        event: Event,
        area: HTMLElement,
        highlight: "first" | null,
    ): void {
        const doc = area.ownerDocument;
        const active = doc.activeElement;
        // focus left in the menu itself (a press while open) keeps the opener it had
        if (!untracked(this.overlay.positioner)?.contains(active)) {
            this.opener =
                active instanceof HTMLElement && active !== doc.body
                    ? active
                    : null;
        }
        this.anchor.set(at instanceof Element ? at : virtualAnchor(at, area));
        this.pendingHighlight = highlight;
        if (!this.overlay.setOpen(true, reason, event, area)) {
            this.pendingHighlight = null;
        }
    }
}
