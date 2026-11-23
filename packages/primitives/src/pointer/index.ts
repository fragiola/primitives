// The entry of @fragiola/primitives/pointer: pointer drags, long presses, the submenu's safe area, the hover bridge and the pointer leaving the document.

export {
    type DragSessionOptions,
    startDrag,
} from "./drag-session.ts";
export { isInHoverBridge } from "./hover-bridge.ts";
export { type LongPressOptions, watchLongPress } from "./long-press.ts";
export { isInSafeArea, type Point } from "./safe-area.ts";
export {
    type HoverBridgeCallbacks,
    trackHoverBridge,
} from "./track-hover-bridge.ts";
export { watchPointerExit } from "./watch-pointer-exit.ts";
