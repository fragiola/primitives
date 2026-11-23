// The entry of @fragiola/primitives-angular/scroll-area: a natively scrolling area with custom
// scrollbars (spec/scroll-area.md, Base UI's ScrollArea), as standalone directives on the
// consumer's own elements. Its measurement and its scrollbars' pointer are the toolkit's
// `/scroll-area`.

export type {
    ScrollAreaOrientation,
    ScrollAreaThreshold,
    ScrollAreaThresholdInput,
} from "@fragiola/primitives/scroll-area";
export { ScrollAreaContent } from "./directives/scroll-area-content.directive.ts";
export { ScrollAreaCorner } from "./directives/scroll-area-corner.directive.ts";
export {
    ScrollAreaRoot,
    type ScrollAreaState,
} from "./directives/scroll-area-root.directive.ts";
export {
    ScrollAreaScrollbar,
    type ScrollAreaScrollbarOptions,
    type ScrollAreaScrollbarState,
} from "./directives/scroll-area-scrollbar.directive.ts";
export {
    ScrollAreaThumb,
    type ScrollAreaThumbState,
} from "./directives/scroll-area-thumb.directive.ts";
export { ScrollAreaViewport } from "./directives/scroll-area-viewport.directive.ts";
