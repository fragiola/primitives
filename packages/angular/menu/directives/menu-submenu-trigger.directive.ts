import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { submenuKeys } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    dataValues,
    injectProvidedDirection,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { menuItemBehaviour } from "./menu-item-behaviour.ts";
import { MenuRootBase } from "./menu-root-base.ts";

export interface MenuSubmenuTriggerState {
    open: boolean;
    highlighted: boolean;
    disabled: boolean;
}

/**
 * An item of the parent menu that opens its submenu (spec/menu.md), inside the
 * `[menuSubmenuRoot]`: `<div menuSubmenuTrigger>`.
 */
@Directive({
    selector: "[menuSubmenuTrigger]",
    exportAs: "menuSubmenuTrigger",
    host: {
        role: "menuitem",
        tabindex: "-1",
        "aria-haspopup": "menu",
        "[attr.data-primitives-part]": "parent.part('submenu-trigger')",
        "[attr.id]": "submenu.overlay.triggerId",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "state().open ? submenu.overlay.popupId : null",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-disabled]": "data().disabled",
        "(focus)": "item.onFocus()",
        "(blur)": "item.onBlur()",
        "(click)": "openSubmenu(null, 'trigger-press', $event)",
        "(keydown)": "onKeyDown($event)",
        "(pointermove)": "onPointerMove($event)",
        "(pointerleave)": "onPointerLeave($event)",
    },
})
export class MenuSubmenuTrigger {
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    protected readonly submenu = inject(MenuRootBase);
    protected readonly parent = this.requireParent();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly label = input<string | undefined>(undefined);
    /** Hovering opens the submenu (default `true`), after `delay` ms (default 100). */
    readonly openOnHover = input(true, { transform: booleanAttribute });
    readonly delay = input(100, { transform: numberAttribute });
    private readonly host = registerHost(this.submenu.overlay.singleTrigger);
    protected readonly item = menuItemBehaviour(
        this.parent,
        this.host,
        this.label,
        true,
    );
    readonly state = computed<MenuSubmenuTriggerState>(() => ({
        open: this.submenu.overlay.open(),
        highlighted: this.item.highlighted(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    }

    private requireParent(): MenuRootBase {
        if (this.submenu.parent === null) {
            throw new Error(
                "[menuSubmenuTrigger] must be inside a [menuSubmenuRoot].",
            );
        }
        return this.submenu.parent;
    }

    protected openSubmenu(
        highlight: "first" | null,
        reason: "trigger-press" | "list-navigation",
        event?: Event,
    ): void {
        if (this.disabled()) {
            return;
        }
        this.submenu.pendingHighlight = highlight;
        this.submenu.overlay.setOpen(true, reason, event);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const { open: openKey } = submenuKeys(
            getDirection(this.host, this.direction()) === "rtl",
        );
        if (
            event.key === openKey ||
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            event.stopPropagation();
            this.openSubmenu(
                "first",
                event.key === openKey ? "list-navigation" : "trigger-press",
                event,
            );
        }
    }

    protected onPointerMove(event: PointerEvent): void {
        this.item.onPointerMove(event);
        if (
            this.openOnHover() &&
            !this.submenu.overlay.open() &&
            this.timer === undefined
        ) {
            this.timer = setTimeout(() => {
                this.timer = undefined;
                this.openSubmenu(null, "trigger-press");
            }, this.delay());
        }
    }

    protected onPointerLeave(event: PointerEvent): void {
        clearTimeout(this.timer);
        this.timer = undefined;
        const popup = this.submenu.overlay.popup();
        if (this.submenu.overlay.open() && popup) {
            this.parent.safeArea = {
                x: event.clientX,
                y: event.clientY,
                submenu: popup,
            };
        }
    }
}
