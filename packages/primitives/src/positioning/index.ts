// The entry of @fragiola/primitives/positioning: anchoring a floating element to its anchor (Floating UI), logical sides and aligns, virtual anchors (a point).

export {
    type AnchorOptions,
    anchorFloating,
} from "./anchor-floating.ts";
export {
    type Align,
    fromPlacement,
    type Side,
    toPlacement,
} from "./placement.ts";
export {
    type AnchorRect,
    type VirtualAnchor,
    virtualAnchor,
} from "./virtual-anchor.ts";
