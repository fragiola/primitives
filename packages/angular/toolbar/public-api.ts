// The entry of @fragiola/primitives-angular/toolbar: a set of controls that is one tab stop, the
// arrows moving between them, a ToggleGroup's Toggles included (spec/toolbar.md, the APG's
// toolbar), as standalone attribute directives on the consumer's own elements. It holds no Toggle
// or ToggleGroup code: they join its focus through the package's roving scope (`/internal`).

export { ToolbarButton } from "./directives/toolbar-button.directive.ts";
export { ToolbarGroup } from "./directives/toolbar-group.directive.ts";
export { ToolbarInput } from "./directives/toolbar-input.directive.ts";
export { ToolbarLink } from "./directives/toolbar-link.directive.ts";
export {
    type ToolbarItemState,
    ToolbarRoot,
    type ToolbarRootState,
} from "./directives/toolbar-root.directive.ts";
export {
    ToolbarSeparator,
    type ToolbarSeparatorState,
} from "./directives/toolbar-separator.directive.ts";
