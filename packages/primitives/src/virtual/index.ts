// The entry of @fragiola/primitives/virtual: the virtualizer (spec/README.md, "Virtual lists"):
// the rows a long list renders for its scroll position (fixed or measured sizes, overscan, pinned
// rows, sticky group labels), the scrolling to a row and the page measure. Written here (AGENTS.md
// rule 2: no runtime dependency beyond `@floating-ui/dom`); only the virtual lists import it, so no
// component that does not opt in ships it.

export {
    activeSticky,
    pageIndex,
    rowAt,
    rowStarts,
    type VirtualLayoutOptions,
    type VirtualRange,
    type VirtualRow,
    virtualLayout,
} from "./virtual-layout.ts";
export {
    createVirtualizer,
    scrollContainer,
    type VirtualAlign,
    type Virtualizer,
    type VirtualizerOptions,
} from "./virtualizer.ts";
