import {
    type Align,
    anchorFloating,
    type Side,
} from "@fragiola/primitives/positioning";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { DirectionContext } from "../direction/direction-context.ts";

export interface PositionOptions {
    side: Side;
    align: Align;
    sideOffset: number;
    alignOffset: number;
    collisionPadding: number;
}

/** Positions `floating` next to `anchor` while both exist, and reports where it ended up. */
export function useAnchorPosition(
    anchor: Element | null,
    floating: HTMLElement | null,
    arrow: HTMLElement | null,
    options: PositionOptions,
) {
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: options.side,
        align: options.align,
    });
    const { side, align, sideOffset, alignOffset, collisionPadding } = options;
    // a DirectionProvider's direction, read at every placement (spec/direction.md)
    const provided = useContext(DirectionContext);
    const direction = useRef(provided);
    direction.current = provided;
    useLayoutEffect(() => {
        if (anchor === null || floating === null) {
            return undefined;
        }
        return anchorFloating(anchor, floating, {
            side,
            align,
            sideOffset,
            alignOffset,
            collisionPadding,
            arrow,
            direction: () => direction.current,
            onPlaced: (next) =>
                setPlaced((previous) =>
                    previous.side === next.side && previous.align === next.align
                        ? previous
                        : next,
                ),
        });
    }, [
        anchor,
        floating,
        arrow,
        side,
        align,
        sideOffset,
        alignOffset,
        collisionPadding,
    ]);
    return placed;
}
