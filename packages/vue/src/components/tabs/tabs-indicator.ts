import {
    placeTabsIndicator,
    tabsIndicatorBox,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { defineComponent, h, ref, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TabsKey, tabId } from "./tabs-context.ts";

/** Follows the selected tab through CSS variables measured from the list (spec/tabs.md). */
export interface TabsIndicatorState {
    orientation: "horizontal" | "vertical";
}

export interface TabsIndicatorProps {
    /**
     * Places it before hydration in a server render (Base UI's name): the server writes a small
     * inline script inside it that measures the selected tab as the page parses, then removes
     * itself (spec/tabs.md, "Server rendering"). Default `false`.
     */
    renderBeforeHydration?: boolean;
}

/** The inline script of a server-rendered Indicator (`renderBeforeHydration`). */
const BEFORE_HYDRATION = `(${placeTabsIndicator.toString()})(document.currentScript)`;

/**
 * It is rendered once the selected tab is measured (at once with `renderBeforeHydration`).
 */
export const TabsIndicator: PartComponent<
    TabsIndicatorProps,
    TabsIndicatorState
> = publicComponent(
    defineComponent({
        name: "TabsIndicator",
        inheritAttrs: false,
        props: {
            ...asProp,
            renderBeforeHydration: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(TabsKey, "Tabs.Indicator");
            const box = ref<Record<string, string> | null>(null);
            watch(
                () =>
                    [
                        context.list.value,
                        context.value.value,
                        context.version.value,
                    ] as const,
                ([list, value], _, onCleanup) => {
                    if (list === null || value === undefined) {
                        box.value = null;
                        return;
                    }
                    const measure = () => {
                        const tab = list.ownerDocument.getElementById(
                            tabId(context.baseId, value),
                        );
                        if (tab === null) {
                            box.value = null;
                            return;
                        }
                        box.value = tabsIndicatorBox(
                            list,
                            tab,
                            getDirection(list) === "rtl",
                        );
                    };
                    measure();
                    const view = list.ownerDocument.defaultView;
                    const observer = view?.ResizeObserver
                        ? new view.ResizeObserver(measure)
                        : null;
                    observer?.observe(list);
                    onCleanup(() => observer?.disconnect());
                },
                { flush: "post", immediate: true },
            );
            return () => {
                // rendered once measured, so it first appears in place; with
                // `renderBeforeHydration` at once (a server measures nothing: its script does)
                if (
                    context.value.value === undefined ||
                    (box.value === null && !props.renderBeforeHydration)
                ) {
                    return null;
                }
                const orientation = context.orientation();
                // only a server writes the script, which removes itself before the browser
                // hydrates
                const script =
                    props.renderBeforeHydration && typeof window === "undefined"
                        ? h("script", { innerHTML: BEFORE_HYDRATION })
                        : null;
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    { orientation },
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "tabs-indicator",
                        ...stateAttributes({
                            orientation,
                            "activation-direction":
                                context.activationDirection.value,
                        }),
                        // no style until measured: a server's script may have set one, which the
                        // hydration must not read as a mismatch
                        ...(box.value === null ? {} : { style: box.value }),
                    },
                    script === null
                        ? undefined
                        : () => [
                              ...(slots.default?.({ state: { orientation } }) ??
                                  []),
                              script,
                          ],
                );
            };
        },
    }),
);
