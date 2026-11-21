// The entry of @fragiola/primitives/pointer: pointer drags, the submenu's safe area and the hover bridge.

export {
    type DragSessionOptions,
    startDrag,
} from "./drag-session.ts";
export { isInHoverBridge } from "./hover-bridge.ts";
export { isInSafeArea, type Point } from "./safe-area.ts";
export {
    type HoverBridgeCallbacks,
    trackHoverBridge,
} from "./track-hover-bridge.ts";
