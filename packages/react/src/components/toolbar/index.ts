// The entry of @fragiola/primitives-react/toolbar: a set of controls that is one tab stop, the
// arrows moving between them, a ToggleGroup's Toggles included (spec/toolbar.md, the APG's
// toolbar). It holds no Toggle or ToggleGroup code: they join its focus through the package's
// roving scope.

export type { RovingOrientation } from "@fragiola/primitives/collection";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Toolbar } from "./parts.ts";
export type { ToolbarButtonProps } from "./toolbar-button.tsx";
export type { ToolbarItemState } from "./toolbar-context.ts";
export type { ToolbarGroupProps } from "./toolbar-group.tsx";
export type { ToolbarInputProps } from "./toolbar-input.tsx";
export type { ToolbarLinkProps, ToolbarLinkState } from "./toolbar-link.tsx";
export type { ToolbarRootProps, ToolbarRootState } from "./toolbar-root.tsx";
export type {
    ToolbarSeparatorProps,
    ToolbarSeparatorState,
} from "./toolbar-separator.tsx";
