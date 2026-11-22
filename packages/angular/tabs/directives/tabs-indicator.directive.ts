import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
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

/**
 * Follows the selected tab through CSS variables measured from the list (spec/tabs.md):
 * `<span *tabsIndicator>` inside the list. Structural, so it is not rendered while no tab is
 * selected, as in React and Vue. The directive writes its attributes on the element it renders.
 */
@Directive({ selector: "[tabsIndicator]", exportAs: "tabsIndicator" })
export class TabsIndicator {
    private readonly root = inject(TabsRoot);
    readonly state = computed<TabsIndicatorState>(() => ({
        orientation: this.root.orientation(),
    }));

    constructor() {
        const root = this.root;
        const element = conditionalView(
            computed(() => root.selected() !== undefined),
            (rendered) =>
                writeAttributes(rendered, {
                    "aria-hidden": "true",
                    "data-primitives-part": "tabs-indicator",
                    "data-orientation": untracked(this.state).orientation,
                }),
        );
        afterRenderEffect(() => {
            const host = element();
            const orientation = this.state().orientation;
            if (host !== null) {
                untracked(() =>
                    writeAttributes(host, { "data-orientation": orientation }),
                );
            }
        });
        afterRenderEffect((onCleanup) => {
            const host = element();
            const list = root.list();
            const value = root.selected();
            root.version();
            if (host === null) {
                return;
            }
            untracked(() => {
                const clear = () => {
                    for (const name of VARIABLES) {
                        host.style.removeProperty(name);
                    }
                };
                if (list === null || value === undefined) {
                    clear();
                    return;
                }
                const measure = () => {
                    const tab = list.ownerDocument.getElementById(
                        root.tabId(value),
                    );
                    if (tab === null) {
                        clear();
                        return;
                    }
                    const listRect = list.getBoundingClientRect();
                    const tabRect = tab.getBoundingClientRect();
                    const inlineStart =
                        getDirection(list) === "rtl"
                            ? listRect.right - tabRect.right
                            : tabRect.left - listRect.left;
                    const values = [
                        inlineStart,
                        tabRect.top - listRect.top,
                        tabRect.width,
                        tabRect.height,
                    ];
                    VARIABLES.forEach((name, index) => {
                        host.style.setProperty(name, `${values[index]}px`);
                    });
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
    }
}
