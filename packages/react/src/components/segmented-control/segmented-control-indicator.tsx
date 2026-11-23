import {
    placeSegmentIndicator,
    segmentIndicatorBox,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    type CSSProperties,
    useContext,
    useLayoutEffect,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { SegmentedControlContext } from "./segmented-control-context.ts";

export interface SegmentedControlIndicatorState {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
}

export interface SegmentedControlIndicatorProps
    extends PartProps<SegmentedControlIndicatorState> {
    /**
     * Places it before hydration in a server render (Base UI's name, as the Tabs Indicator): the
     * server writes a small inline script inside it that measures the checked Item as the page
     * parses, then removes itself (spec/segmented-control.md, "Server rendering"). Default `false`.
     */
    renderBeforeHydration?: boolean;
    /** The `nonce` of the `renderBeforeHydration` script (a Content Security Policy's). */
    nonce?: string;
}

/** The inline script of a server-rendered Indicator (`renderBeforeHydration`). */
const BEFORE_HYDRATION = `(${placeSegmentIndicator.toString()})(document.currentScript)`;

/**
 * Follows the checked Item through CSS variables measured from the Root's padding box
 * (spec/segmented-control.md). It is rendered once the checked Item is measured (at once with
 * `renderBeforeHydration`), and measured again on a resize of the Root or of the Item.
 */
export function SegmentedControlIndicator({
    renderBeforeHydration = false,
    nonce,
    ...props
}: SegmentedControlIndicatorProps) {
    const control = useRequiredContext(
        SegmentedControlContext,
        "SegmentedControl.Indicator",
    );
    const { root, checkedElement, value } = control;
    const provided = useContext(DirectionContext);
    const [box, setBox] = useState<CSSProperties | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: a provider's direction re-measures
    useLayoutEffect(() => {
        if (root === null || checkedElement === null) {
            setBox(null);
            return undefined;
        }
        const measure = () =>
            setBox(
                segmentIndicatorBox(
                    root,
                    checkedElement,
                    getDirection(root) === "rtl",
                ) as CSSProperties,
            );
        measure();
        const view = root.ownerDocument.defaultView;
        const observer = view?.ResizeObserver
            ? new view.ResizeObserver(measure)
            : null;
        observer?.observe(root);
        observer?.observe(checkedElement);
        return () => observer?.disconnect();
    }, [root, checkedElement, provided]);

    // rendered once measured, so it first appears in place; with `renderBeforeHydration` at once
    // (a server measures nothing: its script does)
    if (value === null || (box === null && !renderBeforeHydration)) {
        return null;
    }
    // only a server writes the script, which removes itself before the browser hydrates
    const script =
        renderBeforeHydration && typeof window === "undefined" ? (
            <script
                nonce={nonce}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: the toolkit's own source, no input
                dangerouslySetInnerHTML={{ __html: BEFORE_HYDRATION }}
            />
        ) : null;
    const state = {
        orientation: control.orientation,
        disabled: control.disabled,
    };
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
        state,
        {
            "aria-hidden": "true",
            "data-primitives-part": "segmented-control-indicator",
            ...stateAttributes(state),
            style: box ?? undefined,
            // the server's script set its variables, which the client's first render has not yet
            suppressHydrationWarning: renderBeforeHydration || undefined,
        },
    );
}
