import {
    createScrollArea,
    initialScrollAreaState,
    normalizeScrollAreaThreshold,
    type ScrollAreaController,
    type ScrollAreaPart,
    type ScrollAreaThresholdInput,
} from "@fragiola/primitives/scroll-area";
import {
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    overflowAttributes,
    ScrollAreaContext,
    type ScrollAreaState,
    scrollAreaState,
} from "./scroll-area-context.ts";

export interface ScrollAreaRootProps extends PartProps<ScrollAreaState> {
    /**
     * How far, in pixels, the content must be scrolled from an edge before its `data-overflow-*`
     * attribute is set: one number, or `{ xStart, xEnd, yStart, yEnd }` (default `0`).
     */
    overflowEdgeThreshold?: ScrollAreaThresholdInput;
}

/**
 * The box of a scrolling area (spec/scroll-area.md): it holds the measured state, which the
 * toolkit's `createScrollArea` reports for the parts it registers.
 */
export function ScrollAreaRoot({
    overflowEdgeThreshold,
    ...props
}: ScrollAreaRootProps) {
    const [measured, setMeasured] = useState(initialScrollAreaState);
    const direction = useContext(DirectionContext);
    const threshold = normalizeScrollAreaThreshold(overflowEdgeThreshold);
    const latest = useRef({ direction, threshold });
    latest.current = { direction, threshold };
    const rootRef = useRef<HTMLElement | null>(null);
    const controller = useRef<ScrollAreaController | null>(null);
    // the parts register before the Root's own effect creates the controller (children first)
    const parts = useRef(new Map<ScrollAreaPart, HTMLElement | null>());
    const setPart = useCallback(
        (part: ScrollAreaPart, element: HTMLElement | null) => {
            parts.current.set(part, element);
            controller.current?.setPart(part, element);
        },
        [],
    );
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (root === null) {
            return;
        }
        const created = createScrollArea(root, {
            direction: () => latest.current.direction,
            threshold: () => latest.current.threshold,
            onStateChange: setMeasured,
        });
        controller.current = created;
        for (const [part, element] of parts.current) {
            created.setPart(part, element);
        }
        return () => {
            created.destroy();
            controller.current = null;
            setMeasured(initialScrollAreaState());
        };
    }, []);
    // biome-ignore lint/correctness/useExhaustiveDependencies: a new direction or threshold measures again
    useLayoutEffect(() => {
        controller.current?.update();
    }, [
        direction,
        threshold.xStart,
        threshold.xEnd,
        threshold.yStart,
        threshold.yEnd,
    ]);
    const context = useMemo(() => ({ measured, setPart }), [measured, setPart]);
    const state = scrollAreaState(measured);
    return (
        <ScrollAreaContext.Provider value={context}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "presentation",
                    style: { position: "relative" },
                    "data-primitives-part": "scroll-area-root",
                    ...stateAttributes({
                        scrolling: state.scrolling,
                        ...overflowAttributes(state),
                    }),
                },
                rootRef,
            )}
        </ScrollAreaContext.Provider>
    );
}
