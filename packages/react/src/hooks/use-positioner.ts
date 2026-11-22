import type {
    Align,
    Side,
    VirtualAnchor,
} from "@fragiola/primitives/positioning";
import { useAnchorPosition } from "./use-anchor-position.ts";

export interface PositionerProps {
    side?: Side;
    align?: Align;
    sideOffset?: number;
    alignOffset?: number;
    collisionPadding?: number;
    /** The element to anchor to (default: the trigger). */
    anchor?: Element | null;
}

/**
 * Positions an overlay's positioner from its props, with the given defaults, while `mounted` (open
 * or its exit running): a kept-mounted closed overlay is not positioned (spec/README.md,
 * "Lifecycle").
 */
export function usePositioner(
    props: PositionerProps,
    defaults: { side: Side; align: Align },
    anchor: Element | VirtualAnchor | null,
    positioner: HTMLElement | null,
    arrow: HTMLElement | null,
    mounted = true,
) {
    const target = mounted ? (props.anchor ?? anchor) : null;
    return useAnchorPosition(target, positioner, arrow, {
        side: props.side ?? defaults.side,
        align: props.align ?? defaults.align,
        sideOffset: props.sideOffset ?? 0,
        alignOffset: props.alignOffset ?? 0,
        collisionPadding: props.collisionPadding ?? 8,
    });
}
