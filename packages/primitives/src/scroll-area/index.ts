// The entry of @fragiola/primitives/scroll-area: a ScrollArea's measurement (the thumbs, the overflow edges and their CSS variables), its scrollbars' pointer (thumb drag, track press, wheel) and its hover, and the geometry they compute with.

export {
    createScrollArea,
    initialScrollAreaState,
    normalizeScrollAreaThreshold,
    type ScrollAreaController,
    type ScrollAreaOptions,
    type ScrollAreaOrientation,
    type ScrollAreaPart,
    type ScrollAreaState,
    type ScrollAreaThreshold,
    type ScrollAreaThresholdInput,
} from "./create-scroll-area.ts";
export {
    MIN_THUMB_SIZE,
    scrollForThumbOffset,
    scrollFromStart,
    type ThumbGeometry,
    type ThumbGeometryInput,
    thumbGeometry,
} from "./scroll-geometry.ts";
