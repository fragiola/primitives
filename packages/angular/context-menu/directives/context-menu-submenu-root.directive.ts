import {
    booleanAttribute,
    Directive,
    forwardRef,
    input,
    output,
} from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/internal";
import { MENU_SUBMENU, MenuRootBase } from "@fragiola/primitives-angular/menu";

/**
 * Holds the state of a nested level of the context menu, Menu's SubmenuRoot:
 * `<ng-container contextMenuSubmenuRoot>`, its trigger a `contextMenuSubmenuTrigger` item of the
 * parent level. `close()` and `unmount()` are its actions (`#submenu="contextMenuSubmenuRoot"`).
 */
@Directive({
    selector: "[contextMenuSubmenuRoot]",
    exportAs: "contextMenuSubmenuRoot",
    providers: [
        {
            provide: MenuRootBase,
            useExisting: forwardRef(() => ContextMenuSubmenuRoot),
        },
        { provide: MENU_SUBMENU, useValue: true },
    ],
})
export class ContextMenuSubmenuRoot extends MenuRootBase {
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
}
