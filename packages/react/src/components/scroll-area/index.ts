// The entry of @fragiola/primitives-react/scroll-area: a natively scrolling area with custom
// scrollbars (spec/scroll-area.md, Base UI's ScrollArea). Its measurement and its scrollbars'
// pointer are the toolkit's `/scroll-area`.

export type {
    ScrollAreaOrientation,
    ScrollAreaThreshold,
    ScrollAreaThresholdInput,
} from "@fragiola/primitives/scroll-area";
export type { RenderProp } from "../../utils/render-element.tsx";
export { ScrollArea } from "./parts.ts";
export type { ScrollAreaContentProps } from "./scroll-area-content.tsx";
export type { ScrollAreaState } from "./scroll-area-context.ts";
export type {
    ScrollAreaCornerProps,
    ScrollAreaCornerState,
} from "./scroll-area-corner.tsx";
export type { ScrollAreaRootProps } from "./scroll-area-root.tsx";
export type {
    ScrollAreaScrollbarProps,
    ScrollAreaScrollbarState,
} from "./scroll-area-scrollbar.tsx";
export type {
    ScrollAreaThumbProps,
    ScrollAreaThumbState,
} from "./scroll-area-thumb.tsx";
export type { ScrollAreaViewportProps } from "./scroll-area-viewport.tsx";
