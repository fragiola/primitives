import {
    afterRenderEffect,
    CSP_NONCE,
    computed,
    Directive,
    effect,
    inject,
    input,
    PLATFORM_ID,
    signal,
    untracked,
} from "@angular/core";
import {
    placeTabsIndicator,
    type TabsIndicatorBox,
    tabsIndicatorBox,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    conditionalView,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { type ActivationDirection, TabsRoot } from "./tabs-root.directive.ts";

/** Every variable the Indicator writes, removed while it is not measured. */
const VARIABLES = [
    "--tabs-indicator-inset-inline-start",
    "--tabs-indicator-inset-block-start",
    "--tabs-indicator-inline-size",
    "--tabs-indicator-block-size",
    "--active-tab-left",
    "--active-tab-right",
    "--active-tab-top",
    "--active-tab-bottom",
    "--active-tab-width",
    "--active-tab-height",
] as const satisfies readonly (keyof TabsIndicatorBox)[];

export interface TabsIndicatorState {
    orientation: "horizontal" | "vertical";
    activationDirection: ActivationDirection;
}

/** The inline script of a server-rendered Indicator (`renderBeforeHydration`). */
const BEFORE_HYDRATION = `(${placeTabsIndicator.toString()})(document.currentScript)`;

/**
 * Follows the selected tab through CSS variables measured from the list (spec/tabs.md):
 * `<span *tabsIndicator>` inside the list. Structural: rendered once the selected tab is measured
 * (at once with `renderBeforeHydration`), never while no tab is selected, as in React and Vue. The directive writes its attributes on the element it renders.
 * `*tabsIndicator="true"` places it before hydration in a server render, and
 * `*tabsIndicator="true; nonce: cspNonce"` gives its script a nonce.
 */
@Directive({ selector: "[tabsIndicator]", exportAs: "tabsIndicator" })
export class TabsIndicator {
    private readonly root = inject(TabsRoot);
    /**
     * Places it before hydration in a server render (Base UI's name): the server writes a small
     * inline script inside it that measures the selected tab as the page parses, then removes
     * itself (spec/tabs.md, "Server rendering"). `*tabsIndicator="true"`; default `false`.
     */
    readonly renderBeforeHydration = input(false, {
        alias: "tabsIndicator",
        // `*tabsIndicator` alone gives "": not placed before hydration
        transform: (value: unknown) => value === true || value === "true",
    });
    /**
     * The `nonce` of the `renderBeforeHydration` script, so it runs under a Content Security Policy
     * that allows inline scripts by nonce: `*tabsIndicator="true; nonce: cspNonce"`. Unset, Angular's
     * own `CSP_NONCE` provider (what Angular gives its inline styles).
     */
    readonly nonce = input<string | undefined>(undefined, {
        alias: "tabsIndicatorNonce",
    });
    private readonly cspNonce = inject(CSP_NONCE, { optional: true });
    readonly state = computed<TabsIndicatorState>(() => ({
        orientation: this.root.orientation(),
        activationDirection: this.root.activationDirection(),
    }));

    /** The selected tab's box (the variables' values), once measured. */
    private readonly box = signal<TabsIndicatorBox | null>(null);

    constructor() {
        const root = this.root;
        const box = this.box;
        const element = conditionalView(
            computed(
                () =>
                    root.selected() !== undefined &&
                    (box() !== null || this.renderBeforeHydration()),
            ),
            (rendered) =>
                writeAttributes(rendered, {
                    "aria-hidden": "true",
                    "data-primitives-part": "tabs-indicator",
                    "data-orientation": untracked(this.state).orientation,
                    "data-activation-direction": untracked(this.state)
                        .activationDirection,
                }),
        );
        // only a server writes the script (an after render effect never runs there), which removes
        // itself before the browser hydrates
        if (inject(PLATFORM_ID) === "server") {
            effect(() => {
                const host = element();
                if (host !== null && this.renderBeforeHydration()) {
                    const nonce = this.nonce() ?? this.cspNonce;
                    untracked(() => {
                        const script =
                            host.ownerDocument.createElement("script");
                        if (nonce) {
                            script.setAttribute("nonce", nonce);
                        }
                        script.textContent = BEFORE_HYDRATION;
                        host.appendChild(script);
                    });
                }
            });
        }
        afterRenderEffect(() => {
            const host = element();
            const { orientation, activationDirection } = this.state();
            if (host !== null) {
                untracked(() =>
                    writeAttributes(host, {
                        "data-orientation": orientation,
                        "data-activation-direction": activationDirection,
                    }),
                );
            }
        });
        // measured from the list, so it is first rendered already placed (as React's and Vue's)
        afterRenderEffect((onCleanup) => {
            const list = root.list();
            const value = root.selected();
            root.version();
            untracked(() => {
                if (list === null || value === undefined) {
                    box.set(null);
                    return;
                }
                const measure = () => {
                    const tab = list.ownerDocument.getElementById(
                        root.tabId(value),
                    );
                    if (tab === null) {
                        box.set(null);
                        return;
                    }
                    box.set(
                        tabsIndicatorBox(
                            list,
                            tab,
                            getDirection(list) === "rtl",
                        ),
                    );
                };
                measure();
                const view = list.ownerDocument.defaultView;
                const observer = view?.ResizeObserver
                    ? new view.ResizeObserver(measure)
                    : null;
                observer?.observe(list);
                onCleanup(() => observer?.disconnect());
            });
        });
        afterRenderEffect(() => {
            const host = element();
            const values = box();
            if (host === null) {
                return;
            }
            VARIABLES.forEach((name) => {
                const value = values?.[name];
                if (value === undefined) {
                    host.style.removeProperty(name);
                } else {
                    host.style.setProperty(name, value);
                }
            });
        });
    }
}
