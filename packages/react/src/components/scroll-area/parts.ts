import { ScrollAreaContent } from "./scroll-area-content.tsx";
import { ScrollAreaCorner } from "./scroll-area-corner.tsx";
import { ScrollAreaRoot } from "./scroll-area-root.tsx";
import { ScrollAreaScrollbar } from "./scroll-area-scrollbar.tsx";
import { ScrollAreaThumb } from "./scroll-area-thumb.tsx";
import { ScrollAreaViewport } from "./scroll-area-viewport.tsx";

/** spec/scroll-area.md */
export const ScrollArea = {
    Root: ScrollAreaRoot,
    Viewport: ScrollAreaViewport,
    Content: ScrollAreaContent,
    Scrollbar: ScrollAreaScrollbar,
    Thumb: ScrollAreaThumb,
    Corner: ScrollAreaCorner,
};
