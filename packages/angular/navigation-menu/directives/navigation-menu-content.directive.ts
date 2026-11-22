import {
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    type Signal,
    untracked,
} from "@angular/core";
import { getTabbables } from "@fragiola/primitives/focus";
import {
    conditionalView,
    createPresence,
    dataAttributes,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuItem } from "./navigation-menu-item.directive.ts";
import {
    NAVIGATION_MENU_CONTENT,
    NavigationMenuRoot,
} from "./navigation-menu-root.directive.ts";

export interface NavigationMenuContentState {
    open: boolean;
    activationDirection: string;
}

/**
 * Its item's panel (spec/navigation-menu.md), structural: `<div *navigationMenuContent>`, rendered
 * into the Viewport while its item is open (and while the popup exits after it), its size the
 * popup's size variables. A Root inside it is a nested level. The directive writes the Content's
 * attributes on the element it renders.
 */
@Directive({
    selector: "[navigationMenuContent]",
    exportAs: "navigationMenuContent",
    providers: [{ provide: NAVIGATION_MENU_CONTENT, useValue: true }],
})
export class NavigationMenuContent {
    private readonly root = inject(NavigationMenuRoot);
    private readonly item = inject(NavigationMenuItem);
    // the last open Content stays open while the popup closes; a switch closes the previous one
    private readonly open = computed(() => {
        const value = this.root.current();
        const item = this.item.itemValue();
        return (
            value === item || (value === null && this.root.lastValue() === item)
        );
    });
    private readonly view: { element: Signal<HTMLElement | null> | null } = {
        element: null,
    };
    private readonly presence = createPresence(
        this.open,
        computed(() => this.view.element?.() ?? null),
    );
    readonly state = computed<NavigationMenuContentState>(() => ({
        open: this.open(),
        activationDirection: this.root.activationDirection(),
    }));

    constructor() {
        const root = this.root;
        const item = this.item;
        const presence = this.presence;
        // rendered into the Viewport, as React's portal into it
        const element = conditionalView(
            computed(() => presence.mounted() && root.viewport() !== null),
            (rendered) => untracked(root.viewport)?.appendChild(rendered),
        );
        this.view.element = element;
        inject(DestroyRef).onDestroy(() => {
            const rendered = untracked(element);
            rendered?.parentNode?.removeChild(rendered);
        });
        effect(() => {
            const rendered = element();
            item.content.set(rendered);
            if (rendered === null) {
                return;
            }
            const state = this.state();
            const status = presence.status();
            writeAttributes(rendered, {
                id: item.contentId,
                "data-primitives-part": "navigation-menu-content",
                ...dataAttributes({
                    open: state.open,
                    closed: !state.open,
                    "activation-direction": state.activationDirection,
                    "starting-style": status === "starting",
                    "ending-style": status === "ending",
                }),
            });
        });
        // the open key's focus, once the popup's layer is open
        afterRenderEffect(() => {
            const rendered = element();
            if (!item.open() || rendered === null || !root.layered()) {
                return;
            }
            untracked(() => {
                if (root.pendingFocus === item.itemValue()) {
                    root.pendingFocus = null;
                    getTabbables(rendered)[0]?.focus();
                }
            });
        });
        // the open Content's size is the popup's (its border box)
        afterRenderEffect((onCleanup) => {
            const rendered = element();
            const active = item.open();
            if (!active || rendered === null) {
                return;
            }
            untracked(() => {
                const measure = () =>
                    root.size.set({
                        width: rendered.offsetWidth,
                        height: rendered.offsetHeight,
                    });
                measure();
                const View = rendered.ownerDocument.defaultView?.ResizeObserver;
                if (View === undefined) {
                    return;
                }
                const observer = new View(measure);
                observer.observe(rendered);
                onCleanup(() => observer.disconnect());
            });
        });
    }
}
