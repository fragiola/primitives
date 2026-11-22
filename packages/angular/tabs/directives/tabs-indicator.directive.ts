import {
    afterRenderEffect,
    computed,
    Directive,
    effect,
    inject,
    input,
    PLATFORM_ID,
    signal,
    untracked,
} from "@angular/core";
import { placeTabsIndicator } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    conditionalView,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { TabsRoot } from "./tabs-root.directive.ts";

const VARIABLES = [
    "--tabs-indicator-inset-inline-start",
    "--tabs-indicator-inset-block-start",
    "--tabs-indicator-inline-size",
    "--tabs-indicator-block-size",
] as const;

export interface TabsIndicatorState {
    orientation: "horizontal" | "vertical";
}

/** The inline script of a server-rendered Indicator (`renderBeforeHydration`). */
const BEFORE_HYDRATION = `(${placeTabsIndicator.toString()})(document.currentScript)`;

/**
 * Follows the selected tab through CSS variables measured from the list (spec/tabs.md):
 * `<span *tabsIndicator>` inside the list. Structural: rendered once the selected tab is measured
 * (at once with `renderBeforeHydration`), never while no tab is selected, as in React and Vue. The directive writes its attributes on the element it renders.
 * `*tabsIndicator="true"` places it before hydration in a server render.
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
    readonly state = computed<TabsIndicatorState>(() => ({
        orientation: this.root.orientation(),
    }));

    /** The selected tab's box (the four variables' values), once measured. */
    private readonly box = signal<readonly number[] | null>(null);

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
                }),
        );
        // only a server writes the script (an after render effect never runs there), which removes
        // itself before the browser hydrates
        if (inject(PLATFORM_ID) === "server") {
            effect(() => {
                const host = element();
                if (host !== null && this.renderBeforeHydration()) {
                    untracked(() => {
                        const script =
                            host.ownerDocument.createElement("script");
                        script.textContent = BEFORE_HYDRATION;
                        host.appendChild(script);
                    });
                }
            });
        }
        afterRenderEffect(() => {
            const host = element();
            const orientation = this.state().orientation;
            if (host !== null) {
                untracked(() =>
                    writeAttributes(host, { "data-orientation": orientation }),
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
                    const listRect = list.getBoundingClientRect();
                    const tabRect = tab.getBoundingClientRect();
                    const inlineStart =
                        getDirection(list) === "rtl"
                            ? listRect.right - tabRect.right
                            : tabRect.left - listRect.left;
                    box.set([
                        inlineStart,
                        tabRect.top - listRect.top,
                        tabRect.width,
                        tabRect.height,
                    ]);
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
            VARIABLES.forEach((name, index) => {
                const value = values?.[index];
                if (value === undefined) {
                    host.style.removeProperty(name);
                } else {
                    host.style.setProperty(name, `${value}px`);
                }
            });
        });
    }
}
