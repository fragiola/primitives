import { placeTabsIndicator } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { type CSSProperties, useLayoutEffect, useState } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TabsContext, tabId } from "./tabs-context.ts";

export interface TabsIndicatorProps extends PartProps<{ orientation: string }> {
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
 * Follows the selected tab through CSS variables measured from the list (spec/tabs.md). It is
 * rendered once the selected tab is measured (at once with `renderBeforeHydration`).
 */
export function TabsIndicator({
    renderBeforeHydration = false,
    ...props
}: TabsIndicatorProps) {
    const context = useRequiredContext(TabsContext, "Tabs.Indicator");
    const { list, value, baseId, version } = context;
    const [box, setBox] = useState<CSSProperties | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: `version` re-measures when tabs register
    useLayoutEffect(() => {
        if (list === null || value === undefined) {
            setBox(null);
            return undefined;
        }
        const measure = () => {
            const tab = list.ownerDocument.getElementById(tabId(baseId, value));
            if (tab === null) {
                setBox(null);
                return;
            }
            const listRect = list.getBoundingClientRect();
            const tabRect = tab.getBoundingClientRect();
            const inlineStart =
                getDirection(list) === "rtl"
                    ? listRect.right - tabRect.right
                    : tabRect.left - listRect.left;
            setBox({
                "--tabs-indicator-inset-inline-start": `${inlineStart}px`,
                "--tabs-indicator-inset-block-start": `${tabRect.top - listRect.top}px`,
                "--tabs-indicator-inline-size": `${tabRect.width}px`,
                "--tabs-indicator-block-size": `${tabRect.height}px`,
            } as CSSProperties);
        };
        measure();
        const view = list.ownerDocument.defaultView;
        const observer = view?.ResizeObserver
            ? new view.ResizeObserver(measure)
            : null;
        observer?.observe(list);
        return () => observer?.disconnect();
    }, [list, value, baseId, version]);

    // rendered once measured, so it first appears in place; with `renderBeforeHydration` at once
    // (a server measures nothing: its script does)
    if (value === undefined || (box === null && !renderBeforeHydration)) {
        return null;
    }
    // only a server writes the script, which removes itself before the browser hydrates
    const script =
        renderBeforeHydration && typeof window === "undefined" ? (
            <script
                // biome-ignore lint/security/noDangerouslySetInnerHtml: the toolkit's own source, no input
                dangerouslySetInnerHTML={{ __html: BEFORE_HYDRATION }}
            />
        ) : null;
    return renderElement(
        "span",
        script === null
            ? props
            : {
                  ...props,
                  children: (
                      <>
                          {props.children}
                          {script}
                      </>
                  ),
              },
        { orientation: context.orientation },
        {
            "aria-hidden": "true",
            "data-primitives-part": "tabs-indicator",
            ...stateAttributes({ orientation: context.orientation }),
            style: box ?? undefined,
            // the server's script set its variables, which the client's first render has not yet
            suppressHydrationWarning: renderBeforeHydration || undefined,
        },
    );
}
