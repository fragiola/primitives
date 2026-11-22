import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    input,
    output,
} from "@angular/core";
import {
    attachHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
import type { MenuHandle } from "../utils/menu-handle.ts";
import { MenuRootBase } from "./menu-root-base.ts";

/**
 * Holds the state of one menu level (spec/menu.md): `<ng-container menuRoot [(open)]="open">`,
 * or `<ng-container menuSubmenuRoot>` for a nested level, whose trigger is a `menuSubmenuTrigger`
 * item of the parent menu. One directive for both: the attribute tells them apart. Its `payload()`
 * is the active trigger's payload (`#menu="menuRoot"`); `close()` and `unmount()` are its actions.
 */
@Directive({
    selector: "[menuRoot], [menuSubmenuRoot]",
    exportAs: "menuRoot",
    providers: [
        { provide: MenuRootBase, useExisting: forwardRef(() => MenuRoot) },
    ],
})
export class MenuRoot<Payload = unknown> extends MenuRootBase {
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

    /**
     * Connects `[menuTrigger]`s rendered outside the Root (spec/menu.md, "Detached triggers"); a
     * root menu's only.
     */
    readonly handle = input<MenuHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open` (a root menu's). */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);
    /** The active trigger's payload. */
    readonly payload = computed(
        () => this.overlay.payload() as Payload | undefined,
    );

    constructor() {
        super();
        attachHandle(this.handle, this);
    }
}
