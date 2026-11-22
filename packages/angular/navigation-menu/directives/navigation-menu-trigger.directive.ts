import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
} from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import { getTabbables } from "@fragiola/primitives/focus";
import {
    dataValues,
    injectHost,
    injectProvidedDirection,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuItem } from "./navigation-menu-item.directive.ts";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

export interface NavigationMenuTriggerState {
    open: boolean;
    disabled: boolean;
}

/** A press within this many ms of a hover opening keeps it open (Base UI's patient click). */
const PATIENT_CLICK = 500;

/**
 * Discloses its item's Content (spec/navigation-menu.md): `<button navigationMenuTrigger>`. A
 * hover after the delay, a press, Enter or Space toggle it; the open key opens it with focus
 * inside; Tab from it enters the Content.
 */
@Directive({
    selector: "[navigationMenuTrigger]",
    exportAs: "navigationMenuTrigger",
    host: {
        type: "button",
        "data-primitives-part": "navigation-menu-trigger",
        "[attr.disabled]": "disabled() ? '' : null",
        "[attr.aria-expanded]": "item.open()",
        "[attr.aria-controls]": "item.open() ? item.contentId : null",
        "[attr.data-popup-open]": "data()['popup-open']",
        "[attr.data-disabled]": "data().disabled",
        "(pointerenter)": "onPointerEnter($event)",
        "(pointerleave)": "onPointerLeave($event)",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
    },
})
export class NavigationMenuTrigger {
    protected readonly root = inject(NavigationMenuRoot);
    protected readonly item = inject(NavigationMenuItem);
    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly state = computed<NavigationMenuTriggerState>(() => ({
        open: this.item.open(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            "popup-open": this.item.open(),
            disabled: this.disabled(),
        }),
    );

    constructor() {
        let unregister: (() => void) | null = null;
        effect(() => {
            const value = this.item.itemValue();
            unregister?.();
            unregister = this.root.registerTrigger(value, this.host);
        });
        inject(DestroyRef).onDestroy(() => unregister?.());
    }

    protected onPointerEnter(event: PointerEvent): void {
        if (this.disabled() || event.pointerType === "touch") {
            return;
        }
        const root = this.root;
        if (root.current() !== null) {
            // another Content is open: this one opens at once
            root.hover.cancel();
            if (!this.item.open()) {
                // a hover opening: a press within the patient click's time keeps it open
                root.setValue(
                    this.item.itemValue(),
                    "trigger-hover",
                    event,
                    "hover",
                );
                root.flush();
            }
            return;
        }
        root.pendingHover = this.item.itemValue();
        root.hover.enter(root.delay());
    }

    protected onPointerLeave(event: PointerEvent): void {
        if (event.pointerType === "touch") {
            return;
        }
        const root = this.root;
        if (
            root.current() === null &&
            root.pendingHover === this.item.itemValue()
        ) {
            root.pendingHover = null;
            root.hover.cancel();
        }
    }

    protected onClick(event: MouseEvent): void {
        if (this.disabled()) {
            return;
        }
        const root = this.root;
        root.hover.cancel();
        const opened = root.openedBy;
        if (this.item.open()) {
            if (
                opened.by === "hover" &&
                performance.now() - opened.at < PATIENT_CLICK
            ) {
                // the user aimed for it: it stays open, and the pointer leaving keeps it
                opened.by = "press";
                return;
            }
            root.setValue(null, "trigger-press", event);
        } else {
            root.setValue(
                this.item.itemValue(),
                "trigger-press",
                event,
                "press",
            );
        }
        root.flush();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (this.disabled()) {
            return;
        }
        const root = this.root;
        const rtl = getDirection(this.host, this.direction()) === "rtl";
        const openKey =
            root.orientation() === "horizontal"
                ? "ArrowDown"
                : rtl
                  ? "ArrowLeft"
                  : "ArrowRight";
        const content = this.item.content();
        if (event.key === openKey) {
            event.preventDefault();
            event.stopPropagation();
            root.hover.cancel();
            if (this.item.open() && content) {
                getTabbables(content)[0]?.focus();
                return;
            }
            root.pendingFocus = this.item.itemValue();
            root.setValue(
                this.item.itemValue(),
                "list-navigation",
                event,
                "press",
            );
            root.flush();
            return;
        }
        if (
            event.key === "Tab" &&
            !event.shiftKey &&
            this.item.open() &&
            content
        ) {
            // in the tab order, the Content comes right after its Trigger
            const first = getTabbables(content)[0];
            if (first) {
                event.preventDefault();
                first.focus();
            }
        }
    }
}
