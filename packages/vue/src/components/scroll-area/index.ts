// The entry of @fragiola/primitives-vue/scroll-area: a natively scrolling area with custom
// scrollbars (spec/scroll-area.md, Base UI's ScrollArea). Its measurement and its scrollbars'
// pointer are the toolkit's `/scroll-area`.

export type {
    ScrollAreaOrientation,
    ScrollAreaThreshold,
    ScrollAreaThresholdInput,
} from "@fragiola/primitives/scroll-area";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { ScrollArea } from "./parts.ts";
export type { ScrollAreaState } from "./scroll-area-context.ts";
export type { ScrollAreaCornerState } from "./scroll-area-corner.ts";
export type { ScrollAreaRootProps } from "./scroll-area-root.ts";
export type {
    ScrollAreaScrollbarProps,
    ScrollAreaScrollbarState,
} from "./scroll-area-scrollbar.ts";
export type { ScrollAreaThumbState } from "./scroll-area-thumb.ts";
