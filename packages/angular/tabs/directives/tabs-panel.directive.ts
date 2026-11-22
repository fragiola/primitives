import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    type Signal,
} from "@angular/core";
import {
    conditionalView,
    createPresence,
    dataAttributes,
    type TransitionStatus,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { type ActivationDirection, TabsRoot } from "./tabs-root.directive.ts";

export interface TabsPanelState {
    selected: boolean;
    orientation: string;
    activationDirection: ActivationDirection;
    transitionStatus: TransitionStatus;
}

/**
 * A tab's panel, structural so an inactive panel is not rendered (spec/tabs.md):
 * `<div *tabsPanel="'account'">`, or `*tabsPanel="'account'; keepMounted: true"` to keep it,
 * `hidden`. It has enter and exit states ("Animation"): a panel that stops being selected stays,
 * `inert`, with `data-ending-style` until its animations end. The directive writes the panel's
 * attributes on the element it renders.
 */
@Directive({ selector: "[tabsPanel]", exportAs: "tabsPanel" })
export class TabsPanel {
    private readonly root = inject(TabsRoot);
    readonly value = input.required<string>({ alias: "tabsPanel" });
    /** Keep an inactive panel rendered, `hidden`, once its exit ended (default `false`). */
    readonly keepMounted = input(false, {
        alias: "tabsPanelKeepMounted",
        transform: booleanAttribute,
    });
    private readonly selected = computed(
        () => this.root.selected() === this.value(),
    );
    // the element is the view's, which the presence decides: read once both exist
    private readonly view: { element: Signal<HTMLElement | null> | null } = {
        element: null,
    };
    private readonly presence = createPresence(
        this.selected,
        computed(() => this.view.element?.() ?? null),
        // the panel shown by the first render (or a server render) does not enter
        { enterOnMount: false },
    );
    readonly state = computed<TabsPanelState>(() => ({
        selected: this.selected(),
        orientation: this.root.orientation(),
        activationDirection: this.root.activationDirection(),
        transitionStatus: this.presence.status(),
    }));

    constructor() {
        const presence = this.presence;
        const element = conditionalView(
            computed(() => presence.mounted() || this.keepMounted()),
        );
        this.view.element = element;
        effect(() => {
            const panel = element();
            if (panel === null) {
                return;
            }
            const state = this.state();
            const value = this.value();
            const mounted = presence.mounted();
            writeAttributes(panel, {
                role: "tabpanel",
                id: this.root.panelId(value),
                "aria-labelledby": this.root.tabId(value),
                tabindex: "0",
                hidden: mounted ? null : "",
                inert: !state.selected && mounted ? "" : null,
                "data-primitives-part": "tabs-panel",
                ...dataAttributes({
                    selected: state.selected,
                    orientation: state.orientation,
                    "activation-direction": state.activationDirection,
                    "starting-style": state.transitionStatus === "starting",
                    "ending-style": state.transitionStatus === "ending",
                }),
            });
        });
    }
}
