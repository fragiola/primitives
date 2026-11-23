import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    untracked,
} from "@angular/core";
import {
    inDocumentOrder,
    type RovingOrientation,
    rovingKeys,
    rovingKeyTarget,
    submenuKeys,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    dataValues,
    injectHost,
    injectProvidedDirection,
    injectRovingComposite,
} from "@fragiola/primitives-angular/internal";
import {
    MENU_BAR,
    type MenuBar,
    type MenuBarEntry,
    type MenuRootBase,
    menuItems,
} from "@fragiola/primitives-angular/menu";

export interface MenubarState {
    orientation: RovingOrientation;
    disabled: boolean;
    modal: boolean;
}

/** A press within this time after a hover opened a menu keeps it open (Base UI's patient click). */
const PATIENT_PRESS_MS = 500;

type OpenReason = "list-navigation" | "trigger-press" | "trigger-hover";

/** The open keys of an item: the item of its menu they focus (spec/menubar.md, "Keyboard"). */
function openKeyTarget(
    key: string,
    orientation: RovingOrientation,
    rtl: boolean,
): "first" | "last" | null {
    if (key === "Enter" || key === " ") {
        return "first";
    }
    if (orientation === "vertical") {
        return key === submenuKeys(rtl).open ? "first" : null;
    }
    return key === "ArrowDown" ? "first" : key === "ArrowUp" ? "last" : null;
}

function hasModifier(event: KeyboardEvent): boolean {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * A bar of menus with one tab stop (spec/menubar.md, the APG menubar):
 * `<div menubar aria-label="Application">`. The `[menuTrigger]`s of the `[menuRoot]`s inside it
 * are its items; it moves the focus between them and, while a menu is open, from that menu to the
 * next, by the keys and by hovering. Its menus read it through Menu's `MENU_BAR` contract.
 */
@Directive({
    selector: "[menubar]",
    exportAs: "menubar",
    providers: [
        { provide: MENU_BAR, useFactory: () => inject(Menubar).contract },
    ],
    host: {
        role: "menubar",
        "data-primitives-part": "menubar-root",
        "[attr.aria-orientation]": "state().orientation",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        // a modal menu blocks the pointer outside; the bar takes it back (spec/menubar.md)
        "[style.pointer-events]": "state().modal ? 'auto' : null",
        "(keydown)": "onKeyDown($event)",
    },
})
export class Menubar {
    /** The arrow keys' axis, and where the menus open (default `"horizontal"`). */
    readonly orientation = input<RovingOrientation>("horizontal");
    /** The arrows wrap from the last item to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });
    /**
     * The menus lock the page's scroll and block the pointer outside while open (default `false`:
     * the APG menubar is non-modal; spec/menubar.md, "Modal").
     */
    readonly modal = input(false, { transform: booleanAttribute });
    /** Every item is disabled: focusable, opening nothing. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    private readonly host = injectHost();
    private readonly scope = injectRovingComposite({
        orientation: this.orientation,
        loopFocus: this.loopFocus,
        disabled: this.disabled,
    });
    /** The bar's menus, by their Trigger's element. */
    private readonly entries = new Map<HTMLElement, MenuBarEntry>();
    private hoverOpened: { trigger: HTMLElement; time: number } | null = null;

    readonly state = computed<MenubarState>(() => ({
        orientation: this.orientation(),
        disabled: this.disabled(),
        modal: this.modal(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            orientation: this.orientation(),
            disabled: this.disabled(),
        }),
    );

    /** What the bar's menus read (`MENU_BAR`). */
    readonly contract: MenuBar = {
        scope: this.scope,
        orientation: computed(this.orientation),
        disabled: computed(this.disabled),
        modal: computed(this.modal),
        register: (trigger, entry) => {
            this.entries.set(trigger, entry);
            return () => {
                if (this.entries.get(trigger) === entry) {
                    this.entries.delete(trigger);
                }
            };
        },
        press: (trigger, event) => this.press(trigger, event),
        hover: (trigger, event) => this.hover(trigger, event),
        menuKeyDown: (event, level) => this.menuKeyDown(event, level),
    };

    private rtl(from: Element): boolean {
        return getDirection(from, untracked(this.direction)) === "rtl";
    }

    /** The open menu of the bar and its Trigger, if any. */
    private openOne(): { trigger: HTMLElement; menu: MenuRootBase } | null {
        for (const [trigger, entry] of this.entries) {
            if (untracked(entry.menu.overlay.open)) {
                return { trigger, menu: entry.menu };
            }
        }
        return null;
    }

    /** Opens a Trigger's menu, unless it is disabled. */
    private openMenu(
        trigger: HTMLElement,
        reason: OpenReason,
        event: Event,
        highlight: MenuRootBase["pendingHighlight"],
    ): void {
        const entry = this.entries.get(trigger);
        if (entry === undefined || untracked(entry.disabled)) {
            return;
        }
        entry.menu.pendingHighlight = highlight;
        if (!entry.menu.overlay.setOpen(true, reason, event, trigger)) {
            entry.menu.pendingHighlight = null;
        }
    }

    /**
     * Moves from the open menu to another item (the keys): the focus first, then the open menu
     * closes and the item's menu opens with the focus kept on it (APG).
     */
    private moveTo(
        target: HTMLElement,
        from: MenuRootBase | null,
        event: Event,
    ): void {
        target.focus();
        from?.overlay.setOpen(false, "list-navigation", event);
        this.openMenu(target, "list-navigation", event, "keep");
    }

    private menuKeyDown(event: KeyboardEvent, level: MenuRootBase): boolean {
        if (hasModifier(event)) {
            return false;
        }
        const root = level.root();
        const trigger = untracked(root.overlay.trigger);
        if (trigger === null || !this.entries.has(trigger)) {
            return false;
        }
        const rtl = this.rtl(untracked(level.overlay.popup) ?? trigger);
        const nested = level.parent !== null;
        if (untracked(this.orientation) === "vertical") {
            // the menu sits at the item's end side, as a submenu: its close key goes back
            if (!nested && event.key === submenuKeys(rtl).close) {
                trigger.focus();
                root.overlay.setOpen(false, "list-navigation", event);
                return true;
            }
            return false;
        }
        const { next, previous } = rovingKeys("horizontal", rtl);
        if (event.key !== next && !(event.key === previous && !nested)) {
            return false;
        }
        const triggers = inDocumentOrder([...this.entries.keys()], (t) => t);
        const index = rovingKeyTarget(
            event.key,
            triggers.indexOf(trigger),
            triggers.length,
            { orientation: "horizontal", rtl, loop: untracked(this.loopFocus) },
        );
        const target = index === null ? undefined : triggers[index];
        if (target !== undefined && target !== trigger) {
            this.moveTo(target, root, event);
        }
        return true;
    }

    private press(trigger: HTMLElement, event: MouseEvent): void {
        const entry = this.entries.get(trigger);
        if (entry === undefined || untracked(entry.disabled)) {
            return;
        }
        const { menu } = entry;
        if (!untracked(menu.overlay.open)) {
            this.openMenu(trigger, "trigger-press", event, null);
            return;
        }
        const hovered = this.hoverOpened;
        this.hoverOpened = null;
        if (
            hovered?.trigger === trigger &&
            event.timeStamp - hovered.time < PATIENT_PRESS_MS
        ) {
            return;
        }
        menu.pendingHighlight = null;
        menu.overlay.setOpen(false, "trigger-press", event, trigger);
    }

    private hover(trigger: HTMLElement, event: PointerEvent): void {
        const entry = this.entries.get(trigger);
        // a tap's pointer entering an item is no hover (spec/menubar.md, "Pointer")
        if (
            event.pointerType === "touch" ||
            entry === undefined ||
            untracked(entry.disabled) ||
            untracked(entry.menu.overlay.open)
        ) {
            return;
        }
        const open = this.openOne();
        if (open === null) {
            return;
        }
        open.menu.overlay.setOpen(false, "trigger-hover", event);
        this.openMenu(trigger, "trigger-hover", event, null);
        this.hoverOpened = { trigger, time: event.timeStamp };
        this.scope.focused(trigger);
    }

    // the keys of the bar's items (the Triggers hand theirs to it)
    protected onKeyDown(event: KeyboardEvent): void {
        const trigger = event.target as HTMLElement;
        const entry = this.entries.get(trigger);
        if (entry === undefined || event.defaultPrevented) {
            return;
        }
        const open = this.openOne();
        if (event.key === "Tab") {
            open?.menu.overlay.setOpen(false, "focus-out", event);
            return;
        }
        this.scope.keydown(event);
        if (event.defaultPrevented) {
            const target = trigger.ownerDocument.activeElement;
            if (
                open !== null &&
                target instanceof HTMLElement &&
                target !== trigger &&
                this.entries.has(target)
            ) {
                open.menu.overlay.setOpen(false, "list-navigation", event);
                this.openMenu(target, "list-navigation", event, "keep");
            }
            return;
        }
        if (hasModifier(event)) {
            return;
        }
        const highlight = openKeyTarget(
            event.key,
            untracked(this.orientation),
            this.rtl(this.host),
        );
        if (highlight === null) {
            return;
        }
        event.preventDefault();
        if (untracked(entry.disabled)) {
            return;
        }
        const { menu } = entry;
        if (untracked(menu.overlay.open)) {
            // the focus is on the item of an open menu: the open keys go into it
            const popup = untracked(menu.overlay.popup);
            const items = popup ? menuItems(popup) : [];
            (highlight === "first" ? items[0] : items.at(-1))?.focus({
                preventScroll: true,
            });
            return;
        }
        this.openMenu(
            trigger,
            event.key === "Enter" || event.key === " "
                ? "trigger-press"
                : "list-navigation",
            event,
            highlight,
        );
    }
}
