// The entry of @fragiola/primitives/presence: the next frame and the end of an element's animations (enter and exit states), and a disclosure panel's size and find-in-page match.

export {
    type BeforeMatchOptions,
    freezePanelSize,
    measurePanelSize,
    type PanelSize,
    panelSizeVariables,
    watchBeforeMatch,
} from "./panel-size.ts";
export { isAnimating, nextFrame, waitForAnimations } from "./presence.ts";
