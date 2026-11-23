import { ScrollAreaContent } from "./scroll-area-content.ts";
import { ScrollAreaCorner } from "./scroll-area-corner.ts";
import { ScrollAreaRoot } from "./scroll-area-root.ts";
import { ScrollAreaScrollbar } from "./scroll-area-scrollbar.ts";
import { ScrollAreaThumb } from "./scroll-area-thumb.ts";
import { ScrollAreaViewport } from "./scroll-area-viewport.ts";

/** spec/scroll-area.md */
export const ScrollArea = {
    Root: ScrollAreaRoot,
    Viewport: ScrollAreaViewport,
    Content: ScrollAreaContent,
    Scrollbar: ScrollAreaScrollbar,
    Thumb: ScrollAreaThumb,
    Corner: ScrollAreaCorner,
};
